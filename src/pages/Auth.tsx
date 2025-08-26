import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Car, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
const Auth = () => {
  const {
    user,
    signIn,
    signUp,
    resetPassword,
    loading
  } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {
    toast
  } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState(searchParams.get('mode') || 'signin');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Redirect if already authenticated
  useEffect(() => {
    if (user && !loading) {
      navigate('/dashboard', {
        replace: true
      });
    }
  }, [user, loading, navigate]);
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    const {
      error
    } = await signIn(email, password);
    if (error) {
      setError(error.message || 'Failed to sign in');
    } else {
      toast({
        title: "Success",
        description: "Signed in successfully"
      });
    }
    setIsLoading(false);
  };
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setIsLoading(false);
      return;
    }
    const {
      error
    } = await signUp(email, password, fullName);
    if (error) {
      if (error.message?.includes('already registered')) {
        setError('An account with this email already exists');
      } else {
        setError(error.message || 'Failed to create account');
      }
    } else {
      toast({
        title: "Account created",
        description: "Please check your email to verify your account"
      });
      setMode('signin');
    }
    setIsLoading(false);
  };
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    const {
      error
    } = await resetPassword(email);
    if (error) {
      setError(error.message || 'Failed to send reset email');
    } else {
      toast({
        title: "Reset email sent",
        description: "Check your email for password reset instructions"
      });
      setMode('signin');
    }
    setIsLoading(false);
  };
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>;
  }
  return <div className="min-h-screen flex items-center justify-center p-4" style={{
    backgroundImage: 'url(/lovable-uploads/a783b51e-4b98-458e-89b5-08cdce3e71f1.png)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat'
  }}>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img src="/lovable-uploads/0fe8cfa9-3548-415c-bc9c-114a2b91ae82.png" alt="CEC Car Rental Logo" className="h-12 w-12" />
          </div>
          <CardTitle className="text-2xl">CEC Car Rental</CardTitle>
          <CardDescription>
            Sign in to your account to access the rental management system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={mode} onValueChange={setMode}>
            <TabsList className="grid w-full grid-cols-3 bg-transparent">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
              <TabsTrigger value="reset">Reset</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="Enter your email" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="Enter your password" />
                </div>
                {error && <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>}
                <Button type="submit" disabled={isLoading} className="w-full bg-green-700 hover:bg-green-600">
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Sign In
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input id="fullName" type="text" value={fullName} onChange={e => setFullName(e.target.value)} required placeholder="Enter your full name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="Enter your email" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="Enter your password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input id="confirmPassword" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required placeholder="Confirm your password" />
                </div>
                {error && <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Account
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="reset">
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="Enter your email" />
                </div>
                {error && <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Send Reset Email
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>;
};
export default Auth;