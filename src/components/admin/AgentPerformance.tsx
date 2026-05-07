import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const agents = [
  { name: 'John Doe', sales: '$12,400', orders: 45, avatar: 'JD' },
  { name: 'Jane Smith', sales: '$10,200', orders: 38, avatar: 'JS' },
  { name: 'Mike Johnson', sales: '$8,900', orders: 32, avatar: 'MJ' },
];

export function AgentPerformance() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Performing Agents</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {agents.map((agent) => (
            <div key={agent.name} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback>{agent.avatar}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{agent.name}</p>
                  <p className="text-xs text-muted-foreground">{agent.orders} orders</p>
                </div>
              </div>
              <p className="font-bold">{agent.sales}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
