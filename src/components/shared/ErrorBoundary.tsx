import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg flex flex-col items-center justify-center text-center space-y-4 my-4">
          <AlertCircle className="w-8 h-8 text-red-600" />
          <div>
            <h3 className="text-lg font-semibold text-red-800">Something went wrong</h3>
            <p className="text-sm text-red-600 mt-1">
              {this.state.error?.message || 'An unexpected error occurred.'}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => this.setState({ hasError: false, error: null })}
            className="mt-4"
          >
            Retry
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
