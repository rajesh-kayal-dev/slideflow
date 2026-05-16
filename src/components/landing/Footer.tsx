import { Link } from '@tanstack/react-router';
import { Twitter, Github, Linkedin } from 'lucide-react';
import { BrandName } from '#/components/BrandName';

export function Footer() {
  return (
    <footer className="bg-bgDark2 border-t border-mainBorderDarker pt-16 pb-8">
      <div className="mx-auto w-11/12 xl:w-10/12">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-4">
          
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center justify-start mb-4">
              <img src="/SlideFlowLogo.png" alt="SlideFlow" className="h-8 w-auto shrink-0 mr-2" />
              <div className="font-['Outfit'] text-xl font-extrabold tracking-tight text-white">
                <BrandName />
              </div>
            </Link>
            <p className="text-secondaryText text-sm leading-relaxed mb-6">
              The AI-powered presentation platform for professionals. Build, edit, and export stunning slides in seconds.
            </p>
            <div className="flex gap-4">
              <a href="https://x.com/RajeshKayal_/followers" target="_blank" rel="noreferrer" className="text-secondaryText hover:text-primaryColor transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="https://github.com/rajesh-kayal-dev/SlideFlow.git" target="_blank" rel="noreferrer" className="text-secondaryText hover:text-primaryColor transition-colors">
                <Github className="h-5 w-5" />
              </a>
              <a href="https://www.linkedin.com/in/rajesh110/" target="_blank" rel="noreferrer" className="text-secondaryText hover:text-primaryColor transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-primaryText font-semibold mb-6">Product</h4>
            <ul className="space-y-4">
              <li><Link to="/" hash="features" className="text-secondaryText hover:text-white transition-colors text-sm">Features</Link></li>
              <li><Link to="/" hash="pricing" className="text-secondaryText hover:text-white transition-colors text-sm">Pricing</Link></li>
              <li><a href="#" className="text-secondaryText hover:text-white transition-colors text-sm">Templates</a></li>
              <li><a href="#" className="text-secondaryText hover:text-white transition-colors text-sm">Changelog</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-primaryText font-semibold mb-6">Company</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-secondaryText hover:text-white transition-colors text-sm">About Us</a></li>
              <li><a href="#" className="text-secondaryText hover:text-white transition-colors text-sm">Careers</a></li>
              <li><a href="#" className="text-secondaryText hover:text-white transition-colors text-sm">Blog</a></li>
              <li><Link to="/contact" className="text-secondaryText hover:text-white transition-colors text-sm">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-primaryText font-semibold mb-6">Legal</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-secondaryText hover:text-white transition-colors text-sm">Privacy Policy</a></li>
              <li><a href="#" className="text-secondaryText hover:text-white transition-colors text-sm">Terms of Service</a></li>
              <li><a href="#" className="text-secondaryText hover:text-white transition-colors text-sm">Cookie Policy</a></li>
            </ul>
          </div>

        </div>

        <div className="mt-16 border-t border-mainBorderFaintest pt-8 text-center md:flex md:items-center md:justify-between md:text-left">
          <p className="text-secondaryText text-sm">
            &copy; {new Date().getFullYear()} <BrandName className="text-xs" />. All rights reserved.
          </p>
          <div className="mt-4 md:mt-0 flex justify-center space-x-6 text-sm text-secondaryText">
            <span>Built with TanStack Start & Tailwind CSS</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
