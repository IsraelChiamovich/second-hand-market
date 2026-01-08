import { Link } from "react-router-dom";
import { Search, User, Plus, MessageCircle, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-card border-b border-border">
      <div className="container-main">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">יש</span>
            </div>
            <span className="text-xl font-bold text-foreground hidden sm:block">שוק יד שנייה</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link 
              to="/" 
              className="text-muted-foreground hover:text-foreground transition-base font-medium"
            >
              דף הבית
            </Link>
            <Link 
              to="/categories" 
              className="text-muted-foreground hover:text-foreground transition-base font-medium"
            >
              קטגוריות
            </Link>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <Search className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <MessageCircle className="h-5 w-5" />
            </Button>
            <Link to="/login">
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                <User className="h-5 w-5" />
              </Button>
            </Link>
            <Link to="/upload">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                פרסום מודעה
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border animate-fade-in">
            <nav className="flex flex-col gap-3">
              <Link 
                to="/" 
                className="px-4 py-2 text-foreground hover:bg-muted rounded-lg transition-base"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                דף הבית
              </Link>
              <Link 
                to="/categories" 
                className="px-4 py-2 text-foreground hover:bg-muted rounded-lg transition-base"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                קטגוריות
              </Link>
              <Link 
                to="/messages" 
                className="px-4 py-2 text-foreground hover:bg-muted rounded-lg transition-base"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                הודעות
              </Link>
              <Link 
                to="/login" 
                className="px-4 py-2 text-foreground hover:bg-muted rounded-lg transition-base"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                התחברות
              </Link>
              <Link to="/upload" onClick={() => setIsMobileMenuOpen(false)}>
                <Button className="w-full gap-2 mt-2">
                  <Plus className="h-4 w-4" />
                  פרסום מודעה
                </Button>
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;