import { Navbar } from '@/components/layout';
import { getTranslations } from 'next-intl/server';

export default async function ChatPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'chat' });

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 h-[600px] flex flex-col">
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                {t('title')}
              </h1>
            </div>
            
            {/* Chat Messages Area */}
            <div className="flex-1 p-4 overflow-y-auto">
              <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                <div className="text-center">
                  <div className="text-4xl mb-4">💬</div>
                  <p className="text-lg">{t('emptyState')}</p>
                  <p className="text-sm mt-2">{t('startConversation')}</p>
                </div>
              </div>
            </div>
            
            {/* Chat Input Area */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex space-x-4">
                <input
                  type="text"
                  placeholder={t('inputPlaceholder')}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                  disabled
                />
                <button
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled
                >
                  {t('sendButton')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}