import { useState } from "react";
import { z } from "zod";
import { SEO } from "@/components/common/SEO";
import { SectionHeader } from "@/components/common/SectionHeader";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { toast } from "sonner";

const schema = z.object({
  name: z.string().trim().min(2, "Nome muito curto").max(80),
  email: z.string().trim().email("E-mail inválido").max(160),
  message: z.string().trim().min(10, "Mensagem muito curta").max(1000),
});

type FormData = z.infer<typeof schema>;

const Contact = () => {
  const [data, setData] = useState<FormData>({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(data);
    if (!parsed.success) {
      const errs: Partial<Record<keyof FormData, string>> = {};
      parsed.error.issues.forEach((i) => {
        const key = i.path[0] as keyof FormData;
        errs[key] = i.message;
      });
      setErrors(errs);
      return;
    }
    setErrors({});
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 700));
    toast.success("Mensagem registrada!", { description: "A solicitação foi salva nesta demonstração." });
    setData({ name: "", email: "", message: "" });
    setSubmitting(false);
  };

  return (
    <>
      <SEO title="Contato" description="Fale com a Lumina English Academy. Tire dúvidas e agende sua aula experimental gratuita." />

      <section className="bg-gradient-soft border-b border-border">
        <div className="container-page py-16 md:py-20">
          <SectionHeader eyebrow="Contato" title="Vamos conversar" description="Tire dúvidas, peça orientação ou agende uma aula gratuita. Respondemos em até 24h." />
        </div>
      </section>

      <section className="container-page py-12 md:py-16">
        <div className="grid lg:grid-cols-2 gap-10">
          <Card>
            <CardContent className="p-7 md:p-9">
              <form onSubmit={onSubmit} className="space-y-5" noValidate>
                <div>
                  <Label htmlFor="name">Nome completo</Label>
                  <Input
                    id="name"
                    value={data.name}
                    onChange={(e) => setData((d) => ({ ...d, name: e.target.value }))}
                    placeholder="Seu nome"
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? "name-err" : undefined}
                    className="mt-1.5"
                  />
                  {errors.name && <p id="name-err" className="text-xs text-destructive mt-1">{errors.name}</p>}
                </div>
                <div>
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={data.email}
                    onChange={(e) => setData((d) => ({ ...d, email: e.target.value }))}
                    placeholder="voce@exemplo.com"
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? "email-err" : undefined}
                    className="mt-1.5"
                  />
                  {errors.email && <p id="email-err" className="text-xs text-destructive mt-1">{errors.email}</p>}
                </div>
                <div>
                  <Label htmlFor="message">Mensagem</Label>
                  <Textarea
                    id="message"
                    value={data.message}
                    onChange={(e) => setData((d) => ({ ...d, message: e.target.value }))}
                    placeholder="Conte como podemos ajudar..."
                    rows={6}
                    aria-invalid={!!errors.message}
                    aria-describedby={errors.message ? "msg-err" : undefined}
                    className="mt-1.5"
                  />
                  {errors.message && <p id="msg-err" className="text-xs text-destructive mt-1">{errors.message}</p>}
                </div>
                <Button type="submit" disabled={submitting} className="w-full h-11">
                  {submitting ? "Enviando..." : (<><Send className="h-4 w-4 mr-2" /> Enviar mensagem</>)}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardContent className="p-6 space-y-5">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-lg bg-accent/10 text-accent flex items-center justify-center shrink-0">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-primary">Endereço</h4>
                    <p className="text-sm text-muted-foreground">Campus Lumina Demo · Unidade Central</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-lg bg-accent/10 text-accent flex items-center justify-center shrink-0">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-primary">Telefone</h4>
                    <p className="text-sm text-muted-foreground">+55 (11) 4000-2026</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-lg bg-accent/10 text-accent flex items-center justify-center shrink-0">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-primary">E-mail</h4>
                    <p className="text-sm text-muted-foreground">contato@lumina.demo</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="aspect-[4/3] rounded-lg bg-muted flex items-center justify-center text-muted-foreground border border-border" aria-label="Localização da unidade demonstrativa">
              <div className="text-center">
                <MapPin className="h-10 w-10 mx-auto mb-2 text-accent" />
                <p className="text-sm font-medium">Unidade Central Demo</p>
                <p className="text-xs">Localização fictícia para apresentação</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Contact;
