import { getSiteSettings } from "@/lib/settings";
import { updateSiteSettings } from "@/lib/actions/settings";

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings();

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-3xl text-cocoa mb-2">Configuración</h1>
      <p className="text-sm text-ink/50 mb-8">
        Estos datos se usan en toda la web: el número de WhatsApp es el que reciben todas las
        consultas de productos, pedidos y presupuestos.
      </p>

      <form action={updateSiteSettings} className="space-y-6">
        <Fieldset title="Marca">
          <Field label="Nombre de la marca">
            <input name="brandName" defaultValue={settings.brandName} className="input" />
          </Field>
          <Field label="Ubicación" hint="Se usa en la portada y para orientar el SEO local.">
            <input name="location" defaultValue={settings.location ?? ""} className="input" />
          </Field>
        </Fieldset>

        <Fieldset title="Contacto">
          <Field
            label="Número de WhatsApp"
            hint="Formato internacional sin espacios ni signos, ej: 5493515551234 (código de país + área + número)."
          >
            <input name="whatsappNumber" defaultValue={settings.whatsappNumber ?? ""} placeholder="5493515551234" className="input" />
          </Field>
          <Field label="Instagram">
            <input name="instagramUrl" defaultValue={settings.instagramUrl ?? ""} className="input" />
          </Field>
          <Field label="Horarios de atención">
            <input name="businessHours" defaultValue={settings.businessHours ?? ""} className="input" placeholder="Ej: Lunes a viernes de 9 a 18hs" />
          </Field>
        </Fieldset>

        <Fieldset title="Barra de avisos">
          <Field label="Texto del aviso">
            <input name="announcementText" defaultValue={settings.announcementText ?? ""} className="input" placeholder="Ej: Pedidos abiertos para diciembre" />
          </Field>
          <CheckboxField label="Mostrar la barra de avisos en el sitio" name="announcementIsActive" defaultChecked={settings.announcementIsActive} />
        </Fieldset>

        <Fieldset title="Entrega">
          <div className="grid grid-cols-2 gap-4">
            <CheckboxField label="Ofrece retiro" name="deliveryPickupEnabled" defaultChecked={settings.deliveryPickupEnabled} />
            <CheckboxField label="Ofrece envío" name="deliveryShippingEnabled" defaultChecked={settings.deliveryShippingEnabled} />
          </div>
          <Field label="Medios de pago" hint="Se muestra en el pie de página.">
            <input name="paymentMethodsNote" defaultValue={settings.paymentMethodsNote ?? ""} className="input" />
          </Field>
        </Fieldset>

        <Fieldset title="Portada">
          <Field label="Título principal">
            <input name="heroTitle" defaultValue={settings.heroTitle ?? ""} className="input" />
          </Field>
          <Field label="Subtítulo">
            <textarea name="heroSubtitle" defaultValue={settings.heroSubtitle ?? ""} rows={2} className="input resize-none" />
          </Field>
        </Fieldset>

        <button type="submit" className="rounded-full bg-cocoa text-cream px-6 py-3 text-sm font-medium">
          Guardar configuración
        </button>
      </form>
    </div>
  );
}

function Fieldset({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="rounded-2xl border border-cocoa/10 bg-cream p-6 space-y-5">
      <legend className="font-display text-lg text-cocoa px-1 -ml-1 mb-1">{title}</legend>
      {children}
    </fieldset>
  );
}

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div>
      <label className="text-sm font-medium text-cocoa block mb-1.5">{label}</label>
      {children}
      {hint && <p className="text-xs text-ink/40 mt-1">{hint}</p>}
    </div>
  );
}

function CheckboxField({ label, name, defaultChecked }: { label: string; name: string; defaultChecked?: boolean }) {
  return (
    <label className="flex items-center gap-2.5 text-sm text-ink/70">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="h-4 w-4 rounded border-cocoa/30" />
      {label}
    </label>
  );
}
