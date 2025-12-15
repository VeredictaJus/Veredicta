import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { debugRegistration } from '@/utils/debugRegistration';

export default function RegistrationTest() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  
  const [testData] = useState({
    email: 'teste@veredicta.com',
    password: 'teste123',
    role: 'client' as const,
    profileData: {
      companyName: 'Empresa Teste',
      cnpj: '12.345.678/0001-90',
      contactPerson: 'João Teste',
      phone: '(11) 99999-9999'
    }
  });

  const runTest = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      console.clear();
      console.log('🧪 Starting Registration Test');
      
      const testResult = await debugRegistration(testData);
      setResult(testResult);
      
    } catch (error: any) {
      console.error('Test failed:', error);
      setResult({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle>🧪 Registration Test</CardTitle>
        <CardDescription>
          Test registration flow with debug logging
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Test Email</Label>
          <Input value={testData.email} disabled />
        </div>
        
        <div className="space-y-2">
          <Label>Test Password</Label>
          <Input value={testData.password} disabled />
        </div>
        
        <div className="space-y-2">
          <Label>Role</Label>
          <Input value={testData.role} disabled />
        </div>
        
        <Button 
          onClick={runTest} 
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Testing...' : 'Run Registration Test'}
        </Button>
        
        {result && (
          <Alert variant={result.success ? "default" : "destructive"}>
            <AlertDescription>
              <strong>{result.success ? '✅ Success' : '❌ Failed'}:</strong>
              <br />
              {result.message || result.error}
            </AlertDescription>
          </Alert>
        )}
        
        <div className="text-xs text-gray-500">
          Check browser console for detailed logs
        </div>
      </CardContent>
    </Card>
  );
}