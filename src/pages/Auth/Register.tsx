import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import SubmitButton from '@/components/SubmitButton';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formState, setFormState] = useState({
    status: 'idle',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.target as HTMLFormElement);
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: formData.get('email'),
          password: formData.get('password')
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      setFormState({ status: 'success', message: 'Account created successfully' });
      toast.success('Account created successfully');
      navigate('/dashboard');
    } catch (error: any) {
      setFormState({ 
        status: 'error',
        message: error.message || 'Failed to create account'
      });
      toast.error(error.message || 'Failed to create account');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (formState.status === 'success') {
      navigate('/login');
    }
  }, [formState.status, navigate]);

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-background">
      <div className="w-full max-w-md overflow-hidden rounded-2xl gap-12 flex flex-col">
        <div className="flex flex-col items-center justify-center gap-2 px-4 text-center sm:px-16">
          <h3 className="text-xl font-semibold dark:text-zinc-50">Sign Up</h3>
          <p className="text-sm text-gray-500 dark:text-zinc-400">
            Create an account with your email and password
          </p>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-4 sm:px-16">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="email"
              className="text-zinc-600 font-normal dark:text-zinc-400"
            >
              Email Address
            </label>
            <input
              id="email"
              name="email"
              className="bg-gray-100 p-2 rounded text-md md:text-sm"
              type="email"
              placeholder="user@acme.com"
              autoComplete="email"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="password"
              className="text-zinc-600 font-normal dark:text-zinc-400"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              className="bg-gray-100 p-2 rounded text-md md:text-sm"
              type="password"
              required
            />
          </div>

          <SubmitButton isSubmitting={isSubmitting}>
            {isSubmitting ? 'Creating Account...' : 'Sign Up'}
          </SubmitButton>
          
          <p className="text-center text-sm text-gray-600 mt-4 dark:text-zinc-400">
            {'Already have an account? '}
            <Link
              to="/login"
              className="font-semibold text-gray-800 hover:underline dark:text-zinc-200"
            >
              Sign in
            </Link>
            {' instead.'}
          </p>
        </form>
      </div>
    </div>
  );
}