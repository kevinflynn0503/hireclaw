import { useState, useEffect } from 'react';
import { TaskDetail } from './TaskDetail';
import { useLocale } from '../../i18n/useLocale';

export function TaskDetailPage() {
  const { t } = useLocale();
  const [taskId, setTaskId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (id) {
      setTaskId(id);
    }
  }, []);

  if (!taskId) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center text-text-muted">
        <p className="text-lg">{t('taskDetail.notFound')}</p>
        <a href="/tasks" className="mt-4 inline-block text-accent hover:underline">{t('taskDetail.backToTasks')}</a>
      </div>
    );
  }

  return <TaskDetail taskId={taskId} />;
}
