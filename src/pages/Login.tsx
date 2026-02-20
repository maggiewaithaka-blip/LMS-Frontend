import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// Attempting the correct relative path again, this time without the file extension.
import { useAuth } from '../contexts/AuthContext'; 
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, BookOpen, MousePointer } from 'lucide-react';
import { toast } from 'sonner';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // FIX IMPLEMENTED: Capture the returned User object to confirm success synchronously.
      // We only navigate if the login function successfully returns a user object.
      const loggedInUser = await login(username, password);
      
      if (loggedInUser) {
        toast.success(`Welcome back, ${loggedInUser.username || 'user'}!`);
        // Navigation is now safe because we confirmed the user object was successfully returned.
        navigate('/dashboard');
      } else {
        toast.error('Login successful, but user data was incomplete. Cannot proceed to dashboard.');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-primary p-12 flex-col justify-between text-primary-foreground">
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="relative">
              <BookOpen className="h-12 w-12" />
              <MousePointer className="h-6 w-6 absolute -bottom-1 -right-1" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">CCGD</h1>
              <p className="text-sm opacity-90">College of Career Guidance and Development</p>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="bg-primary-foreground/10 p-3 rounded-lg">
                <GraduationCap className="h-8 w-8" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Professional Development</h3>
                <p className="text-sm opacity-80">Advance your career guidance expertise</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="bg-primary-foreground/10 p-3 rounded-lg">
                <BookOpen className="h-8 w-8" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Comprehensive Courses</h3>
                <p className="text-sm opacity-80">Access curated learning materials</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="bg-primary-foreground/10 p-3 rounded-lg">
                <MousePointer className="h-8 w-8" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Online Learning</h3>
                <p className="text-sm opacity-80">Learn at your own pace, anywhere</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-primary-foreground/20 pt-6">
          <p className="text-sm italic opacity-90">
            "One Purpose, One Mission, One Dream"
          </p>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <Card className="w-full max-w-md shadow-elevated">
          <CardHeader className="space-y-1">
            <div className="flex items-center gap-2 mb-4 lg:hidden">
              <BookOpen className="h-8 w-8 text-primary" />
              <div>
                <CardTitle className="text-2xl">CCGD</CardTitle>
                <p className="text-xs text-muted-foreground">College of Career Guidance and Development</p>
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
            <CardDescription>
              Enter your credentials to access your courses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <Button 
                type="submit" 
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
            
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Note:</strong> Your login credentials have been provided by your administrator. 
                If you're having trouble signing in, please contact support.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;