'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus, Mail, Trash2, Users, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { invitationsService, Invitation, CreateInvitationRequest } from '@/services/invitations';

interface InvitationManagementContentProps {
  locale: string;
}

export default function InvitationManagementContent({ locale }: InvitationManagementContentProps) {
  const { toast } = useToast();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newInvitation, setNewInvitation] = useState<CreateInvitationRequest>({
    email: '',
    role: 'USER',
  });

  useEffect(() => {
    fetchInvitations();
  }, []);

  const fetchInvitations = async () => {
    const result = await invitationsService.getInvitations();
    if (result.success && result.invitations) {
      setInvitations(result.invitations);
    } else {
      toast({
        title: locale === 'ar' ? 'خطأ' : 'Error',
        description: result.message || (locale === 'ar' ? 'فشل في تحميل الدعوات' : 'Failed to load invitations'),
        variant: 'destructive',
      });
    }
    setIsLoading(false);
  };

  const createInvitation = async () => {
    if (!newInvitation.email.trim()) return;

    const result = await invitationsService.createInvitation(newInvitation);
    if (result.success && result.invitation) {
      setInvitations(prev => [...prev, result.invitation!]);
      setNewInvitation({ email: '', role: 'USER' });
      setIsCreateDialogOpen(false);

      toast({
        title: locale === 'ar' ? 'تم إرسال الدعوة' : 'Invitation Sent',
        description: locale === 'ar' ? 'تم إرسال دعوة الانضمام بنجاح' : 'Invitation sent successfully',
      });
    } else {
      toast({
        title: locale === 'ar' ? 'خطأ' : 'Error',
        description: result.message || (locale === 'ar' ? 'فشل في إرسال الدعوة' : 'Failed to send invitation'),
        variant: 'destructive',
      });
    }
  };

  const cancelInvitation = async (id: string) => {
    const result = await invitationsService.cancelInvitation(id);
    if (result.success) {
      setInvitations(prev => prev.filter(inv => inv.id !== id));
      toast({
        title: locale === 'ar' ? 'تم إلغاء الدعوة' : 'Invitation Cancelled',
        description: locale === 'ar' ? 'تم إلغاء الدعوة بنجاح' : 'Invitation cancelled successfully',
      });
    } else {
      toast({
        title: locale === 'ar' ? 'خطأ' : 'Error',
        description: result.message || (locale === 'ar' ? 'فشل في إلغاء الدعوة' : 'Failed to cancel invitation'),
        variant: 'destructive',
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'ACCEPTED':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'EXPIRED':
      case 'CANCELLED':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      PENDING: 'secondary',
      ACCEPTED: 'default',
      EXPIRED: 'destructive',
      CANCELLED: 'destructive',
    } as const;

    const labels = {
      PENDING: locale === 'ar' ? 'في الانتظار' : 'Pending',
      ACCEPTED: locale === 'ar' ? 'مقبولة' : 'Accepted',
      EXPIRED: locale === 'ar' ? 'منتهية الصلاحية' : 'Expired',
      CANCELLED: locale === 'ar' ? 'ملغية' : 'Cancelled',
    };

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            {locale === 'ar' ? 'إدارة الدعوات' : 'Invitation Management'}
          </h2>
          <p className="text-muted-foreground">
            {locale === 'ar' ? 'إرسال وإدارة دعوات الانضمام للفريق' : 'Send and manage team invitation requests'}
          </p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="w-4 h-4 mr-2" />
              {locale === 'ar' ? 'دعوة مستخدم' : 'Invite User'}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {locale === 'ar' ? 'دعوة مستخدم جديد' : 'Invite New User'}
              </DialogTitle>
              <DialogDescription>
                {locale === 'ar' ? 'أدخل البريد الإلكتروني والدور للمستخدم الجديد' : 'Enter email and role for the new user'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">
                  {locale === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={newInvitation.email}
                  onChange={(e) => setNewInvitation(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="user@example.com"
                />
              </div>
              <div>
                <Label htmlFor="role">
                  {locale === 'ar' ? 'الدور' : 'Role'}
                </Label>
                <Select
                  value={newInvitation.role}
                  onValueChange={(value: 'ADMIN' | 'USER') => setNewInvitation(prev => ({ ...prev, role: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USER">
                      {locale === 'ar' ? 'مستخدم' : 'User'}
                    </SelectItem>
                    <SelectItem value="ADMIN">
                      {locale === 'ar' ? 'مدير' : 'Admin'}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                {locale === 'ar' ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button onClick={createInvitation} disabled={!newInvitation.email.trim()}>
                {locale === 'ar' ? 'إرسال الدعوة' : 'Send Invitation'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        {isLoading ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-muted-foreground">
                {locale === 'ar' ? 'جاري التحميل...' : 'Loading...'}
              </div>
            </CardContent>
          </Card>
        ) : invitations.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">
                {locale === 'ar' ? 'لا توجد دعوات' : 'No Invitations'}
              </h3>
              <p className="text-muted-foreground text-center mb-4">
                {locale === 'ar' ? 'لم ترسل أي دعوات بعد' : 'You haven\'t sent any invitations yet'}
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <UserPlus className="w-4 h-4 mr-2" />
                {locale === 'ar' ? 'إرسال أول دعوة' : 'Send Your First Invitation'}
              </Button>
            </CardContent>
          </Card>
        ) : (
          invitations.map((invitation) => (
            <Card key={invitation.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(invitation.status)}
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        {invitation.email}
                      </CardTitle>
                      <CardDescription>
                        {locale === 'ar' ? 'دعي بواسطة' : 'Invited by'}: {invitation.invitedBy.name} •
                        {locale === 'ar' ? 'في' : ''} {new Date(invitation.invitedAt || invitation.createdAt).toLocaleDateString()}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {invitation.role === 'ADMIN' ? (locale === 'ar' ? 'مدير' : 'Admin') : (locale === 'ar' ? 'مستخدم' : 'User')}
                    </Badge>
                    {getStatusBadge(invitation.status)}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    {locale === 'ar' ? 'تنتهي في' : 'Expires'}: {new Date(invitation.expiresAt).toLocaleDateString()}
                  </div>
                  {invitation.status === 'PENDING' && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => {
                        if (window.confirm(locale === 'ar' ? 'هل أنت متأكد من إلغاء هذه الدعوة؟' : 'Are you sure you want to cancel this invitation?')) {
                          cancelInvitation(invitation.id);
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      {locale === 'ar' ? 'إلغاء' : 'Cancel'}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}