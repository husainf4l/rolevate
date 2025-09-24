'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Key, Plus, Copy, Trash2, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ApiKey {
  id: string;
  name: string;
  key: string;
  createdAt: string;
  lastUsed?: string;
  permissions: string[];
  status: 'active' | 'inactive';
}

interface ApiKeysContentProps {
  locale: string;
}

export default function ApiKeysContent({ locale }: ApiKeysContentProps) {
  const { toast } = useToast();
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [newKeyName, setNewKeyName] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Mock data - replace with actual API call
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([
    {
      id: '1',
      name: 'Production API Key',
      key: 'sk_prod_1234567890abcdef',
      createdAt: '2024-01-15',
      lastUsed: '2024-01-20',
      permissions: ['read', 'write', 'delete'],
      status: 'active'
    },
    {
      id: '2',
      name: 'Development API Key',
      key: 'sk_dev_abcdef1234567890',
      createdAt: '2024-01-10',
      lastUsed: '2024-01-18',
      permissions: ['read', 'write'],
      status: 'active'
    }
  ]);

  const toggleKeyVisibility = (keyId: string) => {
    setShowKeys(prev => ({
      ...prev,
      [keyId]: !prev[keyId]
    }));
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: locale === 'ar' ? 'تم النسخ' : 'Copied',
        description: locale === 'ar' ? 'تم نسخ المفتاح إلى الحافظة' : 'API key copied to clipboard',
      });
    } catch (err) {
      toast({
        title: locale === 'ar' ? 'خطأ' : 'Error',
        description: locale === 'ar' ? 'فشل في نسخ المفتاح' : 'Failed to copy API key',
        variant: 'destructive',
      });
    }
  };

  const createNewKey = () => {
    if (!newKeyName.trim()) return;

    const newKey: ApiKey = {
      id: Date.now().toString(),
      name: newKeyName,
      key: `sk_${Math.random().toString(36).substring(2, 15)}`,
      createdAt: new Date().toISOString().split('T')[0],
      permissions: ['read'],
      status: 'active'
    };

    setApiKeys(prev => [...prev, newKey]);
    setNewKeyName('');
    setIsCreateDialogOpen(false);

    toast({
      title: locale === 'ar' ? 'تم إنشاء المفتاح' : 'API Key Created',
      description: locale === 'ar' ? 'تم إنشاء مفتاح API جديد بنجاح' : 'New API key created successfully',
    });
  };

  const deleteKey = (keyId: string) => {
    setApiKeys(prev => prev.filter(key => key.id !== keyId));
    toast({
      title: locale === 'ar' ? 'تم حذف المفتاح' : 'API Key Deleted',
      description: locale === 'ar' ? 'تم حذف مفتاح API بنجاح' : 'API key deleted successfully',
    });
  };

  const regenerateKey = (keyId: string) => {
    setApiKeys(prev => prev.map(key =>
      key.id === keyId
        ? { ...key, key: `sk_${Math.random().toString(36).substring(2, 15)}` }
        : key
    ));

    toast({
      title: locale === 'ar' ? 'تم تجديد المفتاح' : 'API Key Regenerated',
      description: locale === 'ar' ? 'تم تجديد مفتاح API بنجاح' : 'API key regenerated successfully',
    });
  };

  const maskKey = (key: string) => {
    return key.substring(0, 8) + '•'.repeat(key.length - 8);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            {locale === 'ar' ? 'مفاتيح API' : 'API Keys'}
          </h2>
          <p className="text-muted-foreground">
            {locale === 'ar' ? 'إدارة مفاتيح API للوصول إلى الخدمات' : 'Manage API keys for accessing services'}
          </p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              {locale === 'ar' ? 'إنشاء مفتاح جديد' : 'Create New Key'}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {locale === 'ar' ? 'إنشاء مفتاح API جديد' : 'Create New API Key'}
              </DialogTitle>
              <DialogDescription>
                {locale === 'ar' ? 'أدخل اسمًا لمفتاح API الجديد' : 'Enter a name for the new API key'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="keyName">
                  {locale === 'ar' ? 'اسم المفتاح' : 'Key Name'}
                </Label>
                <Input
                  id="keyName"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder={locale === 'ar' ? 'مثال: مفتاح الإنتاج' : 'e.g. Production Key'}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                {locale === 'ar' ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button onClick={createNewKey} disabled={!newKeyName.trim()}>
                {locale === 'ar' ? 'إنشاء' : 'Create'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        {apiKeys.map((apiKey) => (
          <Card key={apiKey.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Key className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <CardTitle className="text-lg">{apiKey.name}</CardTitle>
                    <CardDescription>
                      {locale === 'ar' ? 'تم الإنشاء' : 'Created'}: {apiKey.createdAt}
                      {apiKey.lastUsed && (
                        <> • {locale === 'ar' ? 'آخر استخدام' : 'Last used'}: {apiKey.lastUsed}</>
                      )}
                    </CardDescription>
                  </div>
                </div>
                <Badge variant={apiKey.status === 'active' ? 'default' : 'secondary'}>
                  {apiKey.status === 'active' ? (locale === 'ar' ? 'نشط' : 'Active') : (locale === 'ar' ? 'غير نشط' : 'Inactive')}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                  <code className="flex-1 font-mono text-sm">
                    {showKeys[apiKey.id] ? apiKey.key : maskKey(apiKey.key)}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleKeyVisibility(apiKey.id)}
                  >
                    {showKeys[apiKey.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(apiKey.key)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>

                <div>
                  <h4 className="font-medium mb-2">
                    {locale === 'ar' ? 'الصلاحيات' : 'Permissions'}:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {apiKey.permissions.map((permission, index) => (
                      <Badge key={index} variant="outline">
                        {permission}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => regenerateKey(apiKey.id)}
                  >
                    <RefreshCw className="w-4 h-4 mr-1" />
                    {locale === 'ar' ? 'تجديد' : 'Regenerate'}
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => {
                      if (window.confirm(locale === 'ar' ? 'هل أنت متأكد من حذف هذا المفتاح؟' : 'Are you sure you want to delete this API key?')) {
                        deleteKey(apiKey.id);
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    {locale === 'ar' ? 'حذف' : 'Delete'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {apiKeys.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Key className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">
              {locale === 'ar' ? 'لا توجد مفاتيح API' : 'No API keys'}
            </h3>
            <p className="text-muted-foreground text-center mb-4">
              {locale === 'ar' ? 'لم تقم بإنشاء أي مفاتيح API بعد' : 'You haven\'t created any API keys yet'}
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              {locale === 'ar' ? 'إنشاء مفتاح API الأول' : 'Create Your First API Key'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}