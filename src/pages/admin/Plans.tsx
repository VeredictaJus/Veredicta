import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { CreditCard, Edit, Plus, Trash2, CheckCircle2, Users } from 'lucide-react';
import { toast } from 'sonner';
import { PlansService, Plan, PlanStats } from '@/services/plansService';

export default function Plans() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<Plan>>({});
  const [newPlanData, setNewPlanData] = useState<Partial<Plan>>({
    name: '',
    price: 0,
    petitions_included: 0,
    description: '',
    features: [],
    priority_support: false,
    custom_branding: false,
    is_active: true,
    subscribers: 0
  });

  // 🔄 Carregar planos do Supabase
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        const allPlans = await PlansService.getAllPlans();
        setPlans(allPlans);
      } catch (error) {
        console.error('Error loading plans:', error);
        toast.error('Erro ao carregar planos');
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  // ✅ Restaurar plano Elite
  const handleRestoreElitePlan = async () => {
    try {
      const result = await PlansService.restoreElitePlan();
      
      if (result.success && result.plan) {
        setPlans(prev => [...prev, result.plan!]);
        toast.success('Plano Elite restaurado com sucesso!');
        // Recarregar planos para garantir sincronização
        const allPlans = await PlansService.getAllPlans();
        setPlans(allPlans);
      } else {
        toast.error(result.error || 'Erro ao restaurar plano Elite');
      }
    } catch (error) {
      console.error('Error restoring Elite plan:', error);
      toast.error('Erro ao restaurar plano Elite');
    }
  };

  // ✅ Criar novo plano
  const handleCreatePlan = async () => {
    const { name, price, petitions_included } = newPlanData;
    if (!name || !price || !petitions_included) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    const result = await PlansService.createPlan(newPlanData as Omit<Plan, 'id' | 'created_at' | 'updated_at'>);

    if (result.success && result.plan) {
      setPlans(prev => [...prev, result.plan!]);
      toast.success('Plano criado com sucesso!');
      setNewPlanData({
        name: '',
        price: 0,
        petitions_included: 0,
        description: '',
        features: [],
        priority_support: false,
        custom_branding: false,
        is_active: true,
        subscribers: 0
      });
    } else {
      toast.error(result.error || 'Erro ao criar plano');
    }
  };

  // 🔄 Atualizar plano
  const handleUpdatePlan = async () => {
    if (!selectedPlan) return;

    const result = await PlansService.updatePlan(selectedPlan.id, editFormData);

    if (result.success) {
      setPlans(prev =>
        prev.map(p => (p.id === selectedPlan.id ? { ...p, ...editFormData } : p))
      );
      toast.success('Plano atualizado com sucesso');
      setSelectedPlan(null);
      setEditFormData({});
    } else {
      toast.error(result.error || 'Erro ao atualizar plano');
    }
  };

  // ❌ Remover plano
  const handleDeletePlan = async (id: string) => {
    const result = await PlansService.deletePlan(id);

    if (result.success) {
      setPlans(prev => prev.filter(p => p.id !== id));
      toast.success('Plano removido');
    } else {
      toast.error(result.error || 'Erro ao deletar plano');
    }
  };

  // 🔘 Ativar/desativar plano
  const handleToggleActive = async (id: string, current: boolean) => {
    const result = await PlansService.togglePlanStatus(id, !current);

    if (result.success) {
      setPlans(prev =>
        prev.map(p =>
          p.id === id ? { ...p, is_active: !current } : p
        )
      );
      toast.success('Status atualizado');
    } else {
      toast.error(result.error || 'Erro ao atualizar status');
    }
  };

  const handleEditFieldChange = (field: keyof Plan, value: any) => {
    setEditFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNewPlanFieldChange = (field: keyof Plan, value: any) => {
    setNewPlanData(prev => ({ ...prev, [field]: value }));
  };

  const stats: PlanStats = PlansService.calculateStats(plans);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Gerenciar Planos</h1>
          <p className="text-sm text-muted-foreground">Configure e gerencie os planos de preço</p>
        </div>
        <div className="flex gap-2">
          {!plans.some(p => p.plan_code === 'elite' || p.name.toLowerCase() === 'elite') && (
            <Button 
              variant="outline"
              onClick={handleRestoreElitePlan}
              className="border-orange-600 text-orange-600 hover:bg-orange-50"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Restaurar Plano Elite
            </Button>
          )}
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-orange-600 hover:bg-orange-700">
                <Plus className="h-4 w-4 mr-2" />
                Novo Plano
              </Button>
            </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Novo Plano</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nome do Plano</Label>
                <Input 
                  placeholder="Ex: Básico, Premium..." 
                  value={newPlanData.name || ''}
                  onChange={(e) => handleNewPlanFieldChange('name', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Preço Mensal (R$)</Label>
                <Input 
                  type="number" 
                  placeholder="2000" 
                  value={newPlanData.price || ''}
                  onChange={(e) => handleNewPlanFieldChange('price', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Petições Incluídas</Label>
                <Input 
                  type="number" 
                  placeholder="10" 
                  value={newPlanData.petitions_included || ''}
                  onChange={(e) => handleNewPlanFieldChange('petitions_included', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Descrição (Opcional)</Label>
                <Input 
                  placeholder="Descrição do plano..." 
                  value={newPlanData.description || ''}
                  onChange={(e) => handleNewPlanFieldChange('description', e.target.value)}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch 
                  checked={newPlanData.priority_support || false}
                  onCheckedChange={(checked) => handleNewPlanFieldChange('priority_support', checked)}
                />
                <Label>Suporte prioritário</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch 
                  checked={newPlanData.custom_branding || false}
                  onCheckedChange={(checked) => handleNewPlanFieldChange('custom_branding', checked)}
                />
                <Label>Marca personalizada</Label>
              </div>
              <Button 
                className="w-full bg-orange-600 hover:bg-orange-700"
                onClick={handleCreatePlan}
              >
                Criar Plano
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Receita Total</p>
                <p className="text-2xl font-bold text-green-600">
                  R$ {stats.totalRevenue.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Assinantes</p>
                <p className="text-2xl font-bold">{stats.totalSubscribers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Preço Médio</p>
                <p className="text-2xl font-bold">
                  R$ {Math.round(stats.averagePrice).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Planos Ativos</p>
                <p className="text-2xl font-bold">{stats.activePlans}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

            {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => (
          <Card key={plan.id} className={`relative ${!plan.is_active ? 'opacity-60' : ''}`}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                  <CardDescription className="whitespace-normal text-sm text-muted-foreground">
                    {plan.description}
                  </CardDescription>
                </div>
                <Switch
                  checked={plan.is_active}
                  onCheckedChange={() => handleToggleActive(plan.id, plan.is_active)}
                />
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div>
                <div className="text-3xl font-bold text-orange-600">
                  {PlansService.formatPrice(plan.price)}
                </div>

                {plan.name === 'Start' && (
                  <div className="text-sm text-muted-foreground">por mês</div>
                )}
              </div>

              <div className="space-y-2">
                <p className="font-medium">{plan.petitions_included} petições incluídas</p>
                <div className="space-y-1">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                      {feature}
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Assinantes:</span>
                  <Badge variant="secondary">{plan.subscribers}</Badge>
                </div>
              </div>

              <div className="flex space-x-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        setSelectedPlan(plan);
                        setEditFormData({});
                      }}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Editar Plano: {selectedPlan?.name}</DialogTitle>
                    </DialogHeader>
                    {selectedPlan && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Nome do Plano</Label>
                          <Input
                            value={editFormData.name ?? selectedPlan.name}
                            onChange={(e) => handleEditFieldChange('name', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Preço Mensal (R$)</Label>
                          <Input
                            type="number"
                            value={editFormData.price ?? selectedPlan.price}
                            onChange={(e) => handleEditFieldChange('price', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Petições Incluídas</Label>
                          <Input
                            type="number"
                            value={editFormData.petitions_included ?? selectedPlan.petitions_included}
                            onChange={(e) => handleEditFieldChange('petitions_included', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Descrição</Label>
                          <Input
                            value={editFormData.description ?? selectedPlan.description}
                            onChange={(e) => handleEditFieldChange('description', e.target.value)}
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={editFormData.priority_support ?? selectedPlan.priority_support}
                            onCheckedChange={(checked) => handleEditFieldChange('priority_support', checked)}
                          />
                          <Label>Suporte prioritário</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={editFormData.custom_branding ?? selectedPlan.custom_branding}
                            onCheckedChange={(checked) => handleEditFieldChange('custom_branding', checked)}
                          />
                          <Label>Marca personalizada</Label>
                        </div>
                        <Button
                          className="w-full bg-orange-600 hover:bg-orange-700"
                          onClick={handleUpdatePlan}
                        >
                          Salvar Alterações
                        </Button>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>

                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeletePlan(plan.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
