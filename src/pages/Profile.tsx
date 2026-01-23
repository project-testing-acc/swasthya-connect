import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { User, Phone, Globe, LogOut, Save, Mail } from "lucide-react";

export default function Profile() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user, profile, loading, updateProfile, signOut } = useAuth();
  const { toast } = useToast();

  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [locale, setLocale] = useState(profile?.locale || i18n.language);
  const [saving, setSaving] = useState(false);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <LoadingSpinner size="lg" />
        </div>
      </MainLayout>
    );
  }

  if (!user) {
    navigate("/login");
    return null;
  }

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await updateProfile({
        full_name: fullName,
        phone: phone || null,
        locale,
      });

      if (error) {
        toast({
          title: t("common.error"),
          description: error.message,
          variant: "destructive",
        });
      } else {
        // Update i18n language
        if (locale !== i18n.language) {
          i18n.changeLanguage(locale);
        }
        toast({
          title: t("profile.saved"),
          description: t("profile.savedDescription"),
        });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <MainLayout>
      <div className="container py-6 max-w-2xl">
        <h1 className="text-2xl font-bold mb-6">{t("nav.profile")}</h1>

        <div className="space-y-6">
          {/* Profile Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                {t("profile.personalInfo")}
              </CardTitle>
              <CardDescription>{t("profile.personalInfoDescription")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {t("auth.email")}
                </Label>
                <Input
                  id="email"
                  value={user.email || ""}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">{t("profile.emailCannotChange")}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullName">{t("auth.fullName")}</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={t("auth.fullNamePlaceholder")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  {t("auth.phone")}
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                />
              </div>
            </CardContent>
          </Card>

          {/* Language Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                {t("profile.preferences")}
              </CardTitle>
              <CardDescription>{t("profile.preferencesDescription")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="language">{t("profile.language")}</Label>
                <Select value={locale} onValueChange={setLocale}>
                  <SelectTrigger id="language">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="hi">हिंदी (Hindi)</SelectItem>
                    <SelectItem value="gu">ગુજરાતી (Gujarati)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={handleSave} disabled={saving} className="flex-1">
              {saving ? (
                <LoadingSpinner size="sm" className="mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {t("profile.saveChanges")}
            </Button>
          </div>

          <Separator />

          {/* Sign Out */}
          <Card className="border-destructive/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{t("profile.signOut")}</p>
                  <p className="text-sm text-muted-foreground">{t("profile.signOutDescription")}</p>
                </div>
                <Button variant="outline" onClick={handleSignOut} className="text-destructive hover:text-destructive">
                  <LogOut className="h-4 w-4 mr-2" />
                  {t("auth.logout")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
