'use client'

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from '@/i18n/navigation';

export default function LocaleSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations('common')
  const locale = useLocale();

  return (
    <select
      value={locale}
      onChange={(e) => {
        router.replace(
          {pathname},
          {locale: e.target.value}
        )
      }
    }>
      <option value="en">{t('english')}</option>
      <option value="es">{t('spanish')}</option>
    </select>
  );
};
