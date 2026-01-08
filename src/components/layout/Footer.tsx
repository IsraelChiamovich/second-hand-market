import { Link } from "react-router-dom";
import { Facebook, Instagram, Twitter } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="container-main py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">יש</span>
              </div>
              <span className="text-xl font-bold text-foreground">שוק יד שנייה</span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed">
              פלטפורמה פשוטה ונוחה לקנייה ומכירה של מוצרי יד שנייה. מצאו מציאות או מכרו את הפריטים שלכם בקלות.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">קישורים מהירים</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-foreground transition-base text-sm">
                  דף הבית
                </Link>
              </li>
              <li>
                <Link to="/categories" className="text-muted-foreground hover:text-foreground transition-base text-sm">
                  קטגוריות
                </Link>
              </li>
              <li>
                <Link to="/upload" className="text-muted-foreground hover:text-foreground transition-base text-sm">
                  פרסום מודעה
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-base text-sm">
                  האזור האישי
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">קטגוריות</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/category/furniture" className="text-muted-foreground hover:text-foreground transition-base text-sm">
                  ריהוט
                </Link>
              </li>
              <li>
                <Link to="/category/electronics" className="text-muted-foreground hover:text-foreground transition-base text-sm">
                  אלקטרוניקה
                </Link>
              </li>
              <li>
                <Link to="/category/home" className="text-muted-foreground hover:text-foreground transition-base text-sm">
                  לבית
                </Link>
              </li>
              <li>
                <Link to="/category/books" className="text-muted-foreground hover:text-foreground transition-base text-sm">
                  ספרים
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Social */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">צרו קשר</h4>
            <p className="text-muted-foreground text-sm mb-4">
              support@secondhand.co.il
            </p>
            <div className="flex gap-3">
              <a 
                href="#" 
                className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-base"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-base"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-base"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} שוק יד שנייה. כל הזכויות שמורות.
          </p>
          <div className="flex gap-6">
            <Link to="/privacy" className="text-muted-foreground hover:text-foreground transition-base text-sm">
              מדיניות פרטיות
            </Link>
            <Link to="/terms" className="text-muted-foreground hover:text-foreground transition-base text-sm">
              תנאי שימוש
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;