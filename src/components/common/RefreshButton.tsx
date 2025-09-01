import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import Button from './Button';

interface RefreshButtonProps {
  onRefresh: () => Promise<void>;
  className?: string;
}

const RefreshButton: React.FC<RefreshButtonProps> = ({ onRefresh, className = '' }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
    } catch (error) {
      console.error('Error refreshing:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleRefresh}
      disabled={isRefreshing}
      className={className}
      icon={<RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />}
    >
      {isRefreshing ? 'Refreshing...' : 'Refresh'}
    </Button>
  );
};

export default RefreshButton;
