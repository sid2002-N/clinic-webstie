import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import api from '../../lib/axios';
import { useAuthStore } from '../../store/authStore';
import { Loader2, Check, Building2, Mail, Phone, MapPin } from 'lucide-react';

export default function Settings() {
  const { tenantName } = useAuthStore();
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    college_name: tenantName || '',
    contact_email: '',
    whatsapp_number: '',
    address: '',
  });

  const mutation = useMutation({
    mutationFn: () => api.patch('/settings/', form),
    onSuccess: () => {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    },
  });

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const fields = [
    { key: 'college_name',    label: 'College / Agency Name', icon: Building2, placeholder: 'MES College, Ernakulam',  type: 'text' },
    { key: 'contact_email',   label: 'Contact Email',         icon: Mail,      placeholder: 'admin@college.edu',       type: 'email' },
    { key: 'whatsapp_number', label: 'WhatsApp Number',       icon: Phone,     placeholder: '+91 98765 43210',         type: 'tel' },
    { key: 'address',         label: 'Address',               icon: MapPin,    placeholder: 'City, Kerala',            type: 'text' },
  ] as const;

  return (
    <div className="p-5 md:p-8" style={{ maxWidth: 700, margin: '0 auto' }}>
      <div className="mb-6">
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>
          Manage your college profile and account settings
        </p>
      </div>

      <div
        className="rounded-xl p-6"
        style={{ background: 'var(--surface-base)', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-sm)' }}
      >
        <p className="font-semibold mb-5 pb-4 border-b" style={{
          fontSize: 'var(--text-sm)', color: 'var(--text-secondary)',
          borderColor: 'var(--border-subtle)', textTransform: 'uppercase', letterSpacing: '0.06em',
        }}>
          College Profile
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
          {fields.map(({ key, label, icon: Icon, placeholder, type }) => (
            <div key={key}>
              <label className="field-label">{label}</label>
              <div className="relative">
                <Icon
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: 'var(--text-tertiary)' }}
                />
                <input
                  type={type}
                  value={form[key]}
                  onChange={(e) => set(key, e.target.value)}
                  placeholder={placeholder}
                  className="field-input pl-9"
                />
              </div>
            </div>
          ))}
        </div>

        {mutation.isError && (
          <p className="mb-4" style={{ fontSize: 'var(--text-sm)', color: 'var(--text-danger)' }}>
            Failed to save settings. Please try again.
          </p>
        )}

        <div className="flex items-center gap-3">
          <button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
            className="btn btn-primary"
          >
            {mutation.isPending ? <Loader2 size={15} className="animate-spin" /> : null}
            {mutation.isPending ? 'Saving…' : 'Save Changes'}
          </button>
          {saved && (
            <span className="flex items-center gap-1.5" style={{ fontSize: 'var(--text-sm)', color: 'var(--green-700)' }}>
              <Check size={15} /> Saved successfully
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
