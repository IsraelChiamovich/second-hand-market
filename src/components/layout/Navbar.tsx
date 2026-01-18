import { Link, useNavigate } from "react-router-dom";
import { User, Plus, MessageCircle, Menu, X, LogOut, LayoutDashboard, Heart, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin } from "@/hooks/useAdmin";
import { ThemeToggle } from "@/components/ThemeToggle";
import { toast } from "sonner";

const Navbar = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { data: isAdmin } = useIsAdmin();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("התנתקת בהצלחה");
      navigate("/");
    } catch (error) {
      toast.error("שגיאה בהתנתקות");
    }
  };

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
            {isAdmin && (
              <Link 
                to="/admin" 
                className="text-muted-foreground hover:text-foreground transition-base font-medium flex items-center gap-1"
              >
                <ShieldCheck className="h-4 w-4" />
                ניהול
              </Link>
            )}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            
            {user ? (
              <>
                <Link to="/favorites">
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                    <Heart className="h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/messages">
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                    <MessageCircle className="h-5 w-5" />
                  </Button>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                      <LayoutDashboard className="h-4 w-4 ml-2" />
                      האזור האישי
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/favorites")}>
                      <Heart className="h-4 w-4 ml-2" />
                      מועדפים
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/messages")}>
                      <MessageCircle className="h-4 w-4 ml-2" />
                      הודעות
                    </DropdownMenuItem>
                    {isAdmin && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => navigate("/admin")}>
                          <ShieldCheck className="h-4 w-4 ml-2" />
                          ניהול
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                      <LogOut className="h-4 w-4 ml-2" />
                      התנתקות
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Link to="/upload">
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    פרסום מודעה
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                    התחברות
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="outline">
                    הרשמה
                  </Button>
                </Link>
                <Link to="/upload">
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    פרסום מודעה
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
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
              {user ? (
                <>
                  <Link 
                    to="/dashboard" 
                    className="px-4 py-2 text-foreground hover:bg-muted rounded-lg transition-base"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    האזור האישי
                  </Link>
                  <Link 
                    to="/favorites" 
                    className="px-4 py-2 text-foreground hover:bg-muted rounded-lg transition-base"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    מועדפים
                  </Link>
                  <Link 
                    to="/messages" 
                    className="px-4 py-2 text-foreground hover:bg-muted rounded-lg transition-base"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    הודעות
                  </Link>
                  {isAdmin && (
                    <Link 
                      to="/admin" 
                      className="px-4 py-2 text-foreground hover:bg-muted rounded-lg transition-base flex items-center gap-2"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <ShieldCheck className="h-4 w-4" />
                      ניהול
                    </Link>
                  )}
                  <button 
                    className="px-4 py-2 text-right text-destructive hover:bg-muted rounded-lg transition-base"
                    onClick={() => {
                      handleSignOut();
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    התנתקות
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    className="px-4 py-2 text-foreground hover:bg-muted rounded-lg transition-base"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    התחברות
                  </Link>
                  <Link 
                    to="/register" 
                    className="px-4 py-2 text-foreground hover:bg-muted rounded-lg transition-base"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    הרשמה
                  </Link>
                </>
              )}
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
