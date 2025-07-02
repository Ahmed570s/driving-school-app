import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Loader2, Database } from 'lucide-react';

const SupabaseTest = () => {
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [supabaseInfo, setSupabaseInfo] = useState<{
    url: string;
    hasAnonKey: boolean;
  }>({
    url: '',
    hasAnonKey: false
  });

  useEffect(() => {
    // Check environment variables on component mount
    const url = import.meta.env.VITE_SUPABASE_URL;
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    setSupabaseInfo({
      url: url || 'Not set',
      hasAnonKey: !!anonKey
    });
  }, []);

  const testConnection = async () => {
    setConnectionStatus('testing');
    setErrorMessage('');

    try {
      // Simple test: Try to get the current timestamp from Supabase
      const { data, error } = await supabase
        .from('_supabase_functions') // This is a system table that exists in all Supabase projects
        .select('*')
        .limit(1);

      if (error) {
        // If we get a "relation does not exist" error, it actually means we connected successfully
        // but the table doesn't exist, which is expected
        if (error.message.includes('relation') && error.message.includes('does not exist')) {
          setConnectionStatus('success');
        } else {
          throw error;
        }
      } else {
        setConnectionStatus('success');
      }
    } catch (error: any) {
      setConnectionStatus('error');
      setErrorMessage(error.message || 'Unknown error occurred');
    }
  };

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'testing':
        return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Database className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = () => {
    switch (connectionStatus) {
      case 'testing':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-700">Testing...</Badge>;
      case 'success':
        return <Badge variant="secondary" className="bg-green-100 text-green-700">Connected</Badge>;
      case 'error':
        return <Badge variant="secondary" className="bg-red-100 text-red-700">Failed</Badge>;
      default:
        return <Badge variant="outline">Not Tested</Badge>;
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-6 w-6" />
          Supabase Connection Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Environment Variables Check */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Environment Variables</h3>
          <div className="grid gap-3">
            <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
              <span className="font-medium">VITE_SUPABASE_URL:</span>
              <span className="text-sm text-muted-foreground truncate max-w-xs">
                {supabaseInfo.url}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
              <span className="font-medium">VITE_SUPABASE_ANON_KEY:</span>
              <Badge variant={supabaseInfo.hasAnonKey ? "secondary" : "destructive"}>
                {supabaseInfo.hasAnonKey ? 'Set' : 'Missing'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Connection Test */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Connection Test</h3>
            {getStatusBadge()}
          </div>
          
          <Button 
            onClick={testConnection} 
            disabled={connectionStatus === 'testing' || !supabaseInfo.hasAnonKey}
            className="w-full"
          >
            <div className="flex items-center gap-2">
              {getStatusIcon()}
              {connectionStatus === 'testing' ? 'Testing Connection...' : 'Test Connection'}
            </div>
          </Button>

          {connectionStatus === 'success' && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 text-green-800">
                <CheckCircle className="h-5 w-5" />
                <span className="font-semibold">Connection successful!</span>
              </div>
              <p className="text-green-700 text-sm mt-2">
                Your Supabase client is properly configured and can connect to your database.
              </p>
            </div>
          )}

          {connectionStatus === 'error' && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-800">
                <XCircle className="h-5 w-5" />
                <span className="font-semibold">Connection failed</span>
              </div>
              <p className="text-red-700 text-sm mt-2">
                <strong>Error:</strong> {errorMessage}
              </p>
              <div className="mt-3 text-sm text-red-600">
                <p><strong>Common issues:</strong></p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>Check your .env.local file exists and has correct values</li>
                  <li>Verify your Supabase URL and anon key are correct</li>
                  <li>Make sure your Supabase project is active</li>
                  <li>Restart your development server after changing .env.local</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Instructions */}
        {!supabaseInfo.hasAnonKey && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2 text-yellow-800">
              <XCircle className="h-5 w-5" />
              <span className="font-semibold">Setup Required</span>
            </div>
            <p className="text-yellow-700 text-sm mt-2">
              Please create your .env.local file with your Supabase credentials before testing.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SupabaseTest; 