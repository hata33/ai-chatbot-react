import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useStore } from '@/store/store';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { setToken, setUser } = useStore();
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
        throw new Error(data.message || '注册失败');
      }

      // 存储 token 和用户信息
      setToken(data.token);
      setUser(data.user);

      setFormState({ status: 'success', message: '注册成功' });
      toast.success('注册成功');
      
      // 确保在存储完 token 后再跳转
      setTimeout(() => {
        navigate('/chat', { replace: true });
      }, 100);

    } catch (error: any) {
      setFormState({ 
        status: 'error',
        message: error.message || '注册失败'
      });
      toast.error(error.message || '注册失败');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <h3 className="text-2xl font-semibold">注册</h3>
          <p className="text-sm text-muted-foreground">
            创建您的账户
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">邮箱地址</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="user@example.com"
                autoComplete="email"
                required
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">密码</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
              />
            </div>

            <Button 
              type="submit" 
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? '注册中...' : '注册'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            已有账户？{" "}
            <Link
              to="/login"
              className="font-medium text-primary hover:underline"
            >
              登录
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}