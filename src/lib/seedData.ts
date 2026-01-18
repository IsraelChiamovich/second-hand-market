import { supabase } from "@/integrations/supabase/client";

// Demo users data
const demoUsers = [
  {
    email: "demo1@example.com",
    password: "demo123456",
    fullName: "יוסי כהן",
    phone: "050-1234567",
  },
  {
    email: "demo2@example.com", 
    password: "demo123456",
    fullName: "שרה לוי",
    phone: "052-9876543",
  },
];

// Demo products data
const demoProducts = [
  {
    title: "ספה תלת מושבית בצבע אפור",
    description: "ספה תלת מושבית במצב מעולה, נקנתה לפני שנתיים. רכה ונוחה מאוד. מתאימה לסלון גדול.",
    price: 2500,
    category: "furniture" as const,
    location: "תל אביב",
    images: ["https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=600&fit=crop"],
  },
  {
    title: "טלוויזיה Samsung 55 אינץ'",
    description: "טלוויזיה חכמה 4K במצב מושלם, עם שלט מקורי וקופסה.",
    price: 1800,
    category: "electronics" as const,
    location: "ירושלים",
    images: ["https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800&h=600&fit=crop"],
  },
  {
    title: "כורסא וינטג' עור חום",
    description: "כורסא וינטג' מעור אמיתי, מצב שמור. אידיאלית לפינת קריאה.",
    price: 800,
    category: "furniture" as const,
    location: "חיפה",
    images: ["https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=800&h=600&fit=crop"],
  },
  {
    title: "אוסף ספרי הארי פוטר בעברית",
    description: "כל 7 ספרי הסדרה בעברית, מהדורה מקורית. במצב טוב מאוד.",
    price: 350,
    category: "books" as const,
    location: "נתניה",
    images: ["https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&h=600&fit=crop"],
  },
  {
    title: "מכונת קפה דלונגי",
    description: "מכונת קפה אוטומטית עם מקציף חלב. עובדת מעולה!",
    price: 900,
    category: "home" as const,
    location: "תל אביב",
    images: ["https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=800&h=600&fit=crop"],
  },
  {
    title: "שולחן אוכל מעץ מלא",
    description: "שולחן אוכל מעץ אלון מלא, 6 מקומות ישיבה. כולל 4 כיסאות תואמים.",
    price: 3200,
    category: "furniture" as const,
    location: "באר שבע",
    images: ["https://images.unsplash.com/photo-1617806118233-18e1de247200?w=800&h=600&fit=crop"],
  },
  {
    title: "לפטופ MacBook Pro 14",
    description: "MacBook Pro 2023, שבב M2, 16GB RAM, 512GB SSD. כמו חדש עם אחריות.",
    price: 6500,
    category: "electronics" as const,
    location: "תל אביב",
    images: ["https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&h=600&fit=crop"],
  },
  {
    title: "סט כלי מטבח נירוסטה",
    description: "סט מקצועי של 12 כלי בישול מנירוסטה. מתאים לכל סוגי הכיריים.",
    price: 450,
    category: "home" as const,
    location: "ראשון לציון",
    images: ["https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop"],
  },
];

export interface SeedResult {
  success: boolean;
  message: string;
  users?: { email: string; fullName: string }[];
  productsCount?: number;
}

export async function seedDemoData(): Promise<SeedResult> {
  try {
    // Check if demo data already exists
    const { data: existingProducts } = await supabase
      .from("products")
      .select("id")
      .limit(1);

    if (existingProducts && existingProducts.length > 0) {
      return {
        success: false,
        message: "כבר קיימים מוצרים במערכת. לא ניתן להוסיף נתוני הדגמה.",
      };
    }

    const createdUsers: { email: string; fullName: string; id: string }[] = [];

    // Create demo users
    for (const user of demoUsers) {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: user.email,
        password: user.password,
        options: {
          data: {
            full_name: user.fullName,
            phone: user.phone,
          },
        },
      });

      if (authError) {
        // User might already exist, try to continue
        console.log(`User ${user.email} might already exist:`, authError.message);
        continue;
      }

      if (authData.user) {
        // Update profile with phone
        await supabase
          .from("profiles")
          .update({ phone: user.phone, full_name: user.fullName })
          .eq("user_id", authData.user.id);

        createdUsers.push({
          email: user.email,
          fullName: user.fullName,
          id: authData.user.id,
        });
      }
    }

    // We need at least one user to create products
    if (createdUsers.length === 0) {
      return {
        success: false,
        message: "לא ניתן ליצור משתמשי הדגמה. אנא נסו שוב מאוחר יותר.",
      };
    }

    // Sign out first to make sure we're not logged in
    await supabase.auth.signOut();

    // Sign in as first demo user to create products
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: demoUsers[0].email,
      password: demoUsers[0].password,
    });

    if (signInError) {
      return {
        success: false,
        message: `שגיאה בהתחברות: ${signInError.message}`,
      };
    }

    // Create products - alternating between users
    let productsCreated = 0;
    for (let i = 0; i < demoProducts.length; i++) {
      const product = demoProducts[i];
      const userId = createdUsers[i % createdUsers.length].id;

      // Sign in as the correct user
      if (i > 0 && createdUsers.length > 1 && i % createdUsers.length !== (i - 1) % createdUsers.length) {
        await supabase.auth.signOut();
        await supabase.auth.signInWithPassword({
          email: demoUsers[i % createdUsers.length].email,
          password: demoUsers[i % createdUsers.length].password,
        });
      }

      const { error: productError } = await supabase.from("products").insert({
        ...product,
        user_id: userId,
      });

      if (!productError) {
        productsCreated++;
      } else {
        console.error(`Error creating product ${product.title}:`, productError);
      }
    }

    // Sign out after seeding
    await supabase.auth.signOut();

    return {
      success: true,
      message: `נוצרו ${createdUsers.length} משתמשי הדגמה ו-${productsCreated} מוצרים בהצלחה!`,
      users: createdUsers.map((u) => ({ email: u.email, fullName: u.fullName })),
      productsCount: productsCreated,
    };
  } catch (error: any) {
    console.error("Seed error:", error);
    return {
      success: false,
      message: `שגיאה ביצירת נתוני הדגמה: ${error.message}`,
    };
  }
}

export async function clearDemoData(): Promise<SeedResult> {
  try {
    // This will only work if RLS allows it (user owns the data)
    // In practice, we'd need admin access to fully clear demo data
    return {
      success: false,
      message: "מחיקת נתוני הדגמה אינה זמינה כרגע",
    };
  } catch (error: any) {
    return {
      success: false,
      message: `שגיאה: ${error.message}`,
    };
  }
}
