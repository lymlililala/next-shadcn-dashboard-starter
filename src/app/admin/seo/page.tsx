import PageContainer from '@/components/layout/page-container';
import { getSeoConfig } from '@/features/seo/api/service';
import { SeoConfigForm } from '@/features/seo/components/seo-config-form';
import { SeoPageList } from '@/features/seo/components/seo-page-list';

export const metadata = {
  title: 'SEO 管理'
};

export default async function AdminSeoPage() {
  const config = await getSeoConfig();

  return (
    <PageContainer
      pageTitle='SEO 管理'
      pageDescription='配置网站全局关键词、各页面标题和描述，影响搜索引擎收录效果'
    >
      <div className='space-y-8'>
        {/* 全局 SEO */}
        <section>
          <h2 className='mb-4 text-sm font-semibold'>全局 SEO 设置</h2>
          <SeoConfigForm initialConfig={config} />
        </section>

        {/* 页面级 SEO */}
        <section>
          <h2 className='mb-4 text-sm font-semibold'>页面级 SEO 覆盖</h2>
          <SeoPageList initialConfig={config} />
        </section>
      </div>
    </PageContainer>
  );
}
