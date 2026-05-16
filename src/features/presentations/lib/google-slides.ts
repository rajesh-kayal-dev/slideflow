import { google } from 'googleapis';
import { prisma } from '#/db';

export async function getGoogleAuth(userId: string) {
  const account = await prisma.account.findFirst({
    where: { 
      userId,
      providerId: 'google'
    }
  });

  if (!account || !account.accessToken) {
    console.log('Google Auth Debug: Missing account or access token for user:', userId);
    throw new Error('Google account not connected or access token missing. Please Logout and Login again with Google.');
  }

  const isExpired = account.accessTokenExpiresAt && account.accessTokenExpiresAt < new Date();
  console.log('Google Auth Debug:', {
    hasAccessToken: !!account.accessToken,
    hasRefreshToken: !!account.refreshToken,
    isExpired,
    expiresAt: account.accessTokenExpiresAt
  });

  if (isExpired && !account.refreshToken) {
    throw new Error('Google access token expired and no refresh token found. Please Logout and Login again with Google to grant permissions.');
  }

  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    // Redirect URI is not needed for simple API calls if we have tokens
  );

  auth.setCredentials({
    access_token: account.accessToken,
    refresh_token: account.refreshToken || undefined,
    expiry_date: account.accessTokenExpiresAt?.getTime(),
  });

  // Handle token refreshing automatically and persist to DB
  auth.on('tokens', async (tokens) => {
    if (tokens.access_token) {
      console.log('Google token refreshed, saving to database for user:', userId);
      if (key === "authorization") {
        url.searchParams.set("prompt", "select_account consent");
        url.searchParams.set("access_type", "offline");
      }
      await prisma.account.update({
        where: { id: account.id },
        data: {
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token || account.refreshToken,
          accessTokenExpiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : undefined,
        }
      });
    }
  });

  // Proactively refresh if expired
  if (account.accessTokenExpiresAt && account.accessTokenExpiresAt < new Date() && account.refreshToken) {
    try {
      console.log('Proactively refreshing expired Google token for user:', userId);
      const { credentials } = await auth.refreshAccessToken();
      auth.setCredentials(credentials);
    } catch (err) {
      console.error('Failed to proactively refresh Google token:', err);
    }
  }

  return auth;
}

export async function createGoogleSlides(userId: string, title: string, slides: any[]) {
  const auth = await getGoogleAuth(userId);
  const slidesService = google.slides({ version: 'v1', auth });

  // 1. Create a new presentation
  const presentation = await slidesService.presentations.create({
    requestBody: {
      title,
    },
  });

  const presentationId = presentation.data.presentationId;
  if (!presentationId) throw new Error('Failed to create Google Slides presentation');

  // 2. Prepare batch update requests to add slides and content
  const requests: any[] = [];

  slides.forEach((slide, index) => {
    const slideObjectId = `slide_${index}`;
    const titleId = `title_${index}`;
    const contentId = `content_${index}`;
    
    // 1. Add a new blank slide
    requests.push({
      createSlide: {
        objectId: slideObjectId,
        insertionIndex: index,
        slideLayoutReference: { predefinedLayout: 'BLANK' },
      },
    });

    // 2. Set Slide Background to Dark
    requests.push({
      updatePageProperties: {
        objectId: slideObjectId,
        pageProperties: {
          pageBackgroundFill: {
            solidFill: {
              color: { rgbColor: { red: 0.05, green: 0.05, blue: 0.07 } }, // Very dark blue/black
            },
          },
        },
        fields: 'pageBackgroundFill.solidFill.color',
      },
    });

    // 3. Add Image if exists
    if (slide.imageUrl) {
      requests.push({
        createImage: {
          url: slide.imageUrl,
          elementProperties: {
            pageObjectId: slideObjectId,
            size: {
              width: { magnitude: 720, unit: 'PT' }, // Standard slide width is ~720pt
              height: { magnitude: 405, unit: 'PT' }, // Standard 16:9 height
            },
            transform: {
              scaleX: 1,
              scaleY: 1,
              translateX: 0,
              translateY: 0,
              unit: 'PT',
            },
          },
        },
      });
      
      // Add a subtle overlay or positioning logic if needed, but for now let's just put it as background
    }

    // 4. Add Title Shape
    requests.push({
      createShape: {
        objectId: titleId,
        shapeType: 'TEXT_BOX',
        elementProperties: {
          pageObjectId: slideObjectId,
          size: {
            width: { magnitude: 620, unit: 'PT' },
            height: { magnitude: 80, unit: 'PT' },
          },
          transform: {
            scaleX: 1,
            scaleY: 1,
            translateX: 50,
            translateY: 140, // Centered vertically
            unit: 'PT',
          },
        },
      },
    });

    // 5. Add Content Shape
    requests.push({
      createShape: {
        objectId: contentId,
        shapeType: 'TEXT_BOX',
        elementProperties: {
          pageObjectId: slideObjectId,
          size: {
            width: { magnitude: 620, unit: 'PT' },
            height: { magnitude: 150, unit: 'PT' },
          },
          transform: {
            scaleX: 1,
            scaleY: 1,
            translateX: 50,
            translateY: 220,
            unit: 'PT',
          },
        },
      },
    });

    // 6. Insert Texts
    requests.push({
      insertText: { objectId: titleId, text: slide.title },
    }, {
      insertText: { objectId: contentId, text: slide.content },
    });

    // 7. Style Title (Large, Bold, White, Centered)
    requests.push({
      updateTextStyle: {
        objectId: titleId,
        style: {
          fontSize: { magnitude: 44, unit: 'PT' },
          bold: true,
          foregroundColor: { opaqueColor: { rgbColor: { red: 1, green: 1, blue: 1 } } },
        },
        fields: 'fontSize,bold,foregroundColor',
      },
    }, {
      updateParagraphStyle: {
        objectId: titleId,
        style: { alignment: 'CENTER' },
        fields: 'alignment',
      },
    });

    // 8. Style Content (White, Centered)
    requests.push({
      updateTextStyle: {
        objectId: contentId,
        style: {
          fontSize: { magnitude: 16, unit: 'PT' },
          foregroundColor: { opaqueColor: { rgbColor: { red: 0.9, green: 0.9, blue: 0.9 } } },
        },
        fields: 'fontSize,foregroundColor',
      },
    }, {
      updateParagraphStyle: {
        objectId: contentId,
        style: { alignment: 'CENTER' },
        fields: 'alignment',
      },
    });
  });

  // 3. Execute batch update
  await slidesService.presentations.batchUpdate({
    presentationId,
    requestBody: {
      requests,
    },
  });

  return {
    presentationId,
    url: `https://docs.google.com/presentation/d/${presentationId}/edit`,
  };
}

export async function listGoogleSlides(userId: string) {
  const auth = await getGoogleAuth(userId);
  const drive = google.drive({ version: 'v3', auth });

  const response = await drive.files.list({
    q: "mimeType = 'application/vnd.google-apps.presentation' and trashed = false",
    fields: 'files(id, name, thumbnailLink, modifiedTime, owners)',
    orderBy: 'modifiedTime desc',
    pageSize: 50,
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
  });

  return response.data.files || [];
}

export async function fetchGoogleSlidesContent(userId: string, presentationId: string) {
  const auth = await getGoogleAuth(userId);
  const slidesService = google.slides({ version: 'v1', auth });

  const response = await slidesService.presentations.get({
    presentationId,
  });

  const presentation = response.data;
  if (!presentation.slides) return [];

  return presentation.slides.map((slide, index) => {
    // Extract text from elements
    let title = '';
    let content = '';

    slide.pageElements?.forEach((element) => {
      if (element.shape?.text) {
        const textContent = element.shape.text.textElements
          ?.map((te) => te.textRun?.content)
          .filter(Boolean)
          .join('')
          .trim();

        // Heuristic: If it's a title placeholder, treat as title
        if (element.shape.placeholder?.type?.includes('TITLE')) {
          title = textContent || title;
        } else {
          content += (textContent ? textContent + '\n' : '');
        }
      }
    });

    return {
      title: title || `Slide ${index + 1}`,
      content: content.trim() || 'No content found',
      order: index,
    };
  });
}
