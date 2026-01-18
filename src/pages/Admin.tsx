import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Users, 
  Package, 
  MessageSquare, 
  TrendingUp,
  Star,
  Trash2,
  Loader2,
  ShieldAlert
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { 
  useIsAdmin, 
  useAdminStats, 
  useProductsPerDay,
  useProductsByCategory,
  useAllProductsAdmin,
  useToggleFeatured,
  useAdminDeleteProduct
} from "@/hooks/useAdmin";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from "recharts";
import { toast } from "sonner";

const CATEGORY_NAMES: Record<string, string> = {
  furniture: "ריהוט",
  electronics: "אלקטרוניקה",
  home: "לבית",
  books: "ספרים",
};

const CHART_COLORS = ["hsl(160, 84%, 39%)", "hsl(220, 70%, 50%)", "hsl(38, 92%, 50%)", "hsl(0, 84%, 60%)"];

const Admin = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const { data: isAdmin, isLoading: adminLoading } = useIsAdmin();
  const { data: stats, isLoading: statsLoading } = useAdminStats();
  const { data: productsPerDay } = useProductsPerDay(30);
  const { data: productsByCategory } = useProductsByCategory();
  const { data: allProducts, isLoading: productsLoading } = useAllProductsAdmin();
  const toggleFeatured = useToggleFeatured();
  const deleteProduct = useAdminDeleteProduct();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!adminLoading && isAdmin === false) {
      toast.error("אין לך הרשאה לצפות בעמוד זה");
      navigate("/");
    }
  }, [isAdmin, adminLoading, navigate]);

  if (authLoading || adminLoading) {
    return (
      <Layout>
        <div className="container-main py-12 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!isAdmin) {
    return (
      <Layout>
        <div className="container-main py-12 text-center">
          <ShieldAlert className="h-16 w-16 mx-auto text-destructive mb-4" />
          <h1 className="text-2xl font-bold mb-2">אין גישה</h1>
          <p className="text-muted-foreground">אין לך הרשאת מנהל לצפות בעמוד זה</p>
        </div>
      </Layout>
    );
  }

  const handleToggleFeatured = async (id: string, currentState: boolean) => {
    try {
      await toggleFeatured.mutateAsync({ id, is_featured: !currentState });
      toast.success(currentState ? "הוסר מהמומלצים" : "נוסף למומלצים");
    } catch (error) {
      toast.error("שגיאה בעדכון");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("האם אתה בטוח שברצונך למחוק מודעה זו?")) return;
    
    try {
      await deleteProduct.mutateAsync(id);
      toast.success("המודעה נמחקה");
    } catch (error) {
      toast.error("שגיאה במחיקה");
    }
  };

  const categoryChartData = productsByCategory?.map(item => ({
    name: CATEGORY_NAMES[item.category] || item.category,
    value: Number(item.count)
  })) || [];

  const lineChartData = productsPerDay?.map(item => ({
    date: new Date(item.date).toLocaleDateString('he-IL', { day: 'numeric', month: 'short' }),
    count: Number(item.count)
  })) || [];

  return (
    <Layout>
      <div className="container-main py-8">
        <div className="flex items-center gap-3 mb-8">
          <ShieldAlert className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">לוח בקרה למנהלים</h1>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                סה"כ משתמשים
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? "..." : stats?.total_users || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                סה"כ מודעות
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? "..." : stats?.total_products || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                מודעות השבוע
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? "..." : stats?.products_last_7_days || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats?.products_last_30_days || 0} ב-30 יום אחרונים
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                שיחות והודעות
              </CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? "..." : stats?.total_conversations || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats?.total_messages || 0} הודעות
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Products per day line chart */}
          <Card>
            <CardHeader>
              <CardTitle>מודעות לפי יום (30 יום אחרונים)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={lineChartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      tickLine={{ stroke: 'hsl(var(--border))' }}
                    />
                    <YAxis 
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      tickLine={{ stroke: 'hsl(var(--border))' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                      labelStyle={{ color: 'hsl(var(--foreground))' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="count" 
                      stroke="hsl(160, 84%, 39%)" 
                      strokeWidth={2}
                      name="מודעות"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Category pie chart */}
          <Card>
            <CardHeader>
              <CardTitle>מודעות לפי קטגוריה</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryChartData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Products Table */}
        <Card>
          <CardHeader>
            <CardTitle>מודעות אחרונות</CardTitle>
          </CardHeader>
          <CardContent>
            {productsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : !allProducts || allProducts.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">אין מודעות</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>כותרת</TableHead>
                    <TableHead>בעלים</TableHead>
                    <TableHead>קטגוריה</TableHead>
                    <TableHead>מחיר</TableHead>
                    <TableHead>סטטוס</TableHead>
                    <TableHead>תאריך</TableHead>
                    <TableHead>פעולות</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">
                        {product.title}
                        {product.is_featured && (
                          <Badge variant="secondary" className="mr-2">
                            <Star className="h-3 w-3 ml-1" />
                            מומלץ
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{product.owner_name}</TableCell>
                      <TableCell>{CATEGORY_NAMES[product.category] || product.category}</TableCell>
                      <TableCell>₪{product.price}</TableCell>
                      <TableCell>
                        <Badge variant={product.status === "active" ? "default" : "secondary"}>
                          {product.status === "active" ? "פעיל" : product.status === "sold" ? "נמכר" : "נמחק"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(product.created_at).toLocaleDateString('he-IL')}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant={product.is_featured ? "default" : "outline"}
                            onClick={() => handleToggleFeatured(product.id, product.is_featured)}
                            disabled={toggleFeatured.isPending}
                          >
                            <Star className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(product.id)}
                            disabled={deleteProduct.isPending || product.status === "deleted"}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Admin;
