'use client';

import { useState, useTransition } from 'react';
import type { PlayerProfile } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Edit, Save, Trash2, PlusCircle, Loader2, Handshake, Sparkles, RefreshCw, Palette, Image as ImageIcon, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { updatePlayer, deletePlayerAction } from '@/app/actions';
import { Badge } from '@/components/ui/badge';
import { Switch } from './ui/switch';
import Image from 'next/image';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ScrollArea } from './ui/scroll-area';
import { cn } from '@/lib/utils';

interface PlayerManagementProps {
  players: PlayerProfile[];
}

const dartsBackgrounds = [
    { id: '1', url: 'https://images.unsplash.com/photo-1544098485-2a216e2133c1', name: 'Классическая мишень' },
    { id: '2', url: 'https://images.unsplash.com/photo-1611003228941-98a52e6dc4b5', name: 'Бросок в движении' },
    { id: '3', url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5', name: 'Точный центр' },
    { id: '4', url: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a', name: 'Глубина доски' },
    { id: '5', url: 'https://images.unsplash.com/photo-1629901976594-82408f40153d', name: 'Темный абстракт' },
    { id: '6', url: 'https://images.unsplash.com/photo-1559131397-f94da358f7ca', name: 'Неоновый дартс' },
    { id: '7', url: 'https://images.unsplash.com/photo-1614032684758-598ce4536df1', name: 'Оперения' },
    { id: '8', url: 'https://images.unsplash.com/photo-1504450758481-7338ef752242', name: 'Про-Арена' },
    { id: '9', url: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b', name: 'Атмосфера паба' },
    { id: '10', url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018', name: 'Четкие сектора' },
    { id: '11', url: 'https://images.unsplash.com/photo-1553481187-be93c21490a9', name: 'Красный дротик' },
    { id: '12', url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773', name: 'Стальное острие' },
    { id: '13', url: 'https://images.unsplash.com/photo-1541270941804-004aa8099093', name: 'Размытый фокус' },
    { id: '14', url: 'https://images.unsplash.com/photo-1530541930197-ff16ac917b0e', name: 'Спортивный азарт' },
    { id: '15', url: 'https://images.unsplash.com/photo-1511886929837-354d827aae26', name: 'Фокусировка' },
    { id: '16', url: 'https://images.unsplash.com/photo-1557683316-973673baf926', name: 'Градиент игры' },
    { id: '17', url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853', name: 'Энергия броска' },
];

const randomSlogans = [
    "Поддержите талант!",
    "Станьте частью команды",
    "Ваш бренд — наш успех",
    "Вместе к вершине!",
    "Инвестируйте в успех",
    "Поддержите стремление к победе",
    "Станьте спонсором мастерства",
    "Развиваем дартс вместе"
];

const sponsorTemplates = [
    { id: 'default', name: 'Классическое стекло' },
    { id: 'neon', name: 'Неоновый акцент' },
    { id: 'premium', name: 'Золотой премиум' },
    { id: 'minimal', name: 'Минимализм' },
    { id: 'banner', name: 'Яркий баннер' },
];

function PlayerFormDialog({ 
    player, 
    mode = 'edit', 
    trigger 
}: { 
    player?: PlayerProfile, 
    mode?: 'edit' | 'create',
    trigger?: React.ReactNode
}) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  // Default values for new players now include template background #1
  const initialData: PlayerProfile = player || {
      id: '',
      name: '',
      nickname: 'Новичок',
      avatarUrl: 'https://picsum.photos/seed/newplayer/400/400',
      bio: '',
      imageHint: 'person portrait',
      backgroundUrl: 'https://images.unsplash.com/photo-1544098485-2a216e2133c1',
      backgroundImageHint: 'abstract background',
      sponsorName: '',
      sponsorLogoUrl: '',
      sponsorLink: '',
      sponsorTemplateId: 'default',
      showSponsorCta: true,
      sponsorCtaText: ''
  };
  const [formData, setFormData] = useState<PlayerProfile>(initialData);

  const handleSave = () => {
    if (!formData.name) {
        toast({ title: 'Ошибка', description: 'Имя обязательно.', variant: 'destructive' });
        return;
    }
    
    startTransition(async () => {
        const result = await updatePlayer(formData);
        toast({
            title: result.success ? 'Успешно' : 'Ошибка',
            description: result.message,
            variant: result.success ? 'default' : 'destructive',
        });
    });
  };

  const generateRandomSlogan = () => {
      const slogan = randomSlogans[Math.floor(Math.random() * randomSlogans.length)];
      setFormData({ ...formData, sponsorCtaText: slogan });
  };
  
  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] glassmorphism max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === 'edit' ? 'Редактировать игрока' : 'Добавить игрока'}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="id" className="text-right">ID</Label>
            <Input 
                id="id" 
                value={formData.id} 
                onChange={e => setFormData({...formData, id: e.target.value.toLowerCase().replace(/\s+/g, '-')})} 
                className="col-span-3" 
                disabled={mode === 'edit'} 
                placeholder="ivan-ivanov"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">Имя</Label>
            <Input id="name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="col-span-3" placeholder="Иван Иванов" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="nickname" className="text-right">Никнейм</Label>
            <Input id="nickname" value={formData.nickname} onChange={e => setFormData({...formData, nickname: e.target.value})} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="bio" className="text-right">Биография</Label>
            <Textarea id="bio" value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} className="col-span-3" rows={3} />
          </div>
          
          <div className="border-t pt-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-primary mb-4 flex items-center gap-2">
                  <ImageIcon className="h-3 w-3" />
                  Фон карточки (17 Дартс-шаблонов)
              </h4>
              <div className="grid gap-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="backgroundUrl" className="text-right">URL фона</Label>
                    <Input id="backgroundUrl" value={formData.backgroundUrl || ''} onChange={e => setFormData({...formData, backgroundUrl: e.target.value})} className="col-span-3" placeholder="https://..." />
                  </div>
                  <div className="col-span-4">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-3 text-center">Или выберите один из готовых шаблонов:</p>
                      <ScrollArea className="h-48 border rounded-xl p-4 bg-black/20">
                          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                              {dartsBackgrounds.map((bg) => (
                                  <button
                                      key={bg.id}
                                      type="button"
                                      onClick={() => setFormData({ ...formData, backgroundUrl: bg.url })}
                                      className={cn(
                                          "group relative aspect-video rounded-lg overflow-hidden border-2 transition-all",
                                          formData.backgroundUrl === bg.url ? "border-primary shadow-[0_0_15px_hsl(var(--primary)/0.5)]" : "border-transparent hover:border-primary/50"
                                      )}
                                  >
                                      <Image src={bg.url} alt={bg.name} fill className="object-cover" unoptimized />
                                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                          <p className="text-[8px] text-white font-bold uppercase text-center px-1">{bg.name}</p>
                                      </div>
                                      {formData.backgroundUrl === bg.url && (
                                          <div className="absolute top-1 right-1 bg-primary text-primary-foreground rounded-full p-0.5">
                                              <Check className="h-3 w-3" />
                                          </div>
                                      )}
                                  </button>
                              ))}
                          </div>
                      </ScrollArea>
                  </div>
              </div>
          </div>
          
          <div className="border-t pt-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-primary mb-4 flex items-center gap-2">
                  <Handshake className="h-3 w-3" />
                  Спонсор игрока
              </h4>
              <div className="grid gap-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="sponsorName" className="text-right">Название</Label>
                    <Input id="sponsorName" value={formData.sponsorName || ''} onChange={e => setFormData({...formData, sponsorName: e.target.value})} className="col-span-3" placeholder="Напр. Магазин 'Дартс Про'" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="sponsorLogoUrl" className="text-right">URL лого</Label>
                    <Input id="sponsorLogoUrl" value={formData.sponsorLogoUrl || ''} onChange={e => setFormData({...formData, sponsorLogoUrl: e.target.value})} className="col-span-3" placeholder="https://..." />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="sponsorLink" className="text-right">Ссылка</Label>
                    <Input id="sponsorLink" value={formData.sponsorLink || ''} onChange={e => setFormData({...formData, sponsorLink: e.target.value})} className="col-span-3" placeholder="https://..." />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="sponsorTemplate" className="text-right">Шаблон</Label>
                    <Select value={formData.sponsorTemplateId || 'default'} onValueChange={(val: any) => setFormData({...formData, sponsorTemplateId: val})}>
                        <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Выберите стиль виджета" />
                        </SelectTrigger>
                        <SelectContent>
                            {sponsorTemplates.map(t => (
                                <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                  </div>
              </div>
          </div>

          <div className="border-t pt-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-accent mb-4 flex items-center gap-2">
                  <Sparkles className="h-3 w-3" />
                  Реклама спонсорства
              </h4>
              <div className="grid gap-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="showSponsorCta" className="text-right">Показывать призыв</Label>
                    <div className="col-span-3 flex items-center">
                        <Switch id="showSponsorCta" checked={formData.showSponsorCta !== false} onCheckedChange={(checked) => setFormData({...formData, showSponsorCta: checked})} />
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="sponsorCtaText" className="text-right">Текст призыва</Label>
                    <div className="col-span-3 flex gap-2">
                        <Input 
                            id="sponsorCtaText" 
                            value={formData.sponsorCtaText || ''} 
                            onChange={e => setFormData({...formData, sponsorCtaText: e.target.value})} 
                            placeholder="Оставьте пустым для случайного слогана"
                        />
                        <Button type="button" variant="outline" size="icon" onClick={generateRandomSlogan} title="Сгенерировать случайно">
                            <RefreshCw className="h-4 w-4" />
                        </Button>
                    </div>
                  </div>
              </div>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button onClick={handleSave} disabled={isPending}>
              {isPending ? <Loader2 className="animate-spin" /> : <Save />}
              {mode === 'edit' ? 'Сохранить изменения' : 'Создать профиль'}
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function PlayerManagement({ players }: PlayerManagementProps) {
  const { toast } = useToast();
  const [isDeletePending, startDeleteTransition] = useTransition();

  const handleDelete = (id: string, name: string) => {
      if (!confirm(`Вы действительно хотите удалить игрока "${name}"? Это действие нельзя отменить.`)) return;
      
      startDeleteTransition(async () => {
          const result = await deletePlayerAction(id);
          toast({
              title: result.success ? 'Удалено' : 'Ошибка',
              description: result.message,
              variant: result.success ? 'default' : 'destructive',
          });
      });
  };

  return (
    <CardContent className="p-0">
      <div className="flex justify-end mb-6">
          <PlayerFormDialog 
            mode="create" 
            trigger={<Button className="gap-2"><PlusCircle className="h-4 w-4" /> Добавить игрока вручную</Button>} 
          />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Игрок</TableHead>
            <TableHead>Спонсор</TableHead>
            <TableHead className="text-right">Действия</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {players.map((player) => (
            <TableRow key={player.id}>
              <TableCell>
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src={player.avatarUrl} alt={player.name} data-ai-hint={player.imageHint} />
                    <AvatarFallback>{player.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <p className="font-medium">{player.name}</p>
                    <Badge variant="secondary" className="font-normal w-fit mt-1">{player.nickname}</Badge>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                {player.sponsorName ? (
                    <div className="flex items-center gap-2">
                        <div className="h-6 w-6 relative bg-white rounded border border-primary/10 p-0.5">
                            {player.sponsorLogoUrl ? (
                                <Image src={player.sponsorLogoUrl} alt={player.sponsorName} fill className="object-contain" />
                            ) : <Handshake className="h-full w-full text-primary/40" />}
                        </div>
                        <span className="text-sm font-medium">{player.sponsorName}</span>
                        {player.sponsorTemplateId && <Palette className="h-3 w-3 text-muted-foreground opacity-50" title={`Стиль: ${player.sponsorTemplateId}`} />}
                    </div>
                ) : <span className="text-xs text-muted-foreground italic">Нет спонсора</span>}
              </TableCell>
              <TableCell className="text-right space-x-2">
                <PlayerFormDialog player={player} mode="edit" />
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-destructive hover:bg-destructive/10" 
                    onClick={() => handleDelete(player.id, player.name)}
                    disabled={isDeletePending}
                >
                  {isDeletePending ? <Loader2 className="animate-spin h-4 w-4" /> : <Trash2 className="h-4 w-4" />}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </CardContent>
  );
}
