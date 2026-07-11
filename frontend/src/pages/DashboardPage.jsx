import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageShell from '../components/layout/PageShell';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorBanner from '../components/common/ErrorBanner';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import LectureCard from '../components/dashboard/LectureCard';
import FilterBar from '../components/dashboard/FilterBar';
import { useAuth } from '../context/AuthContext';
import { useLectures } from '../hooks/useLectures';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [category, setCategory] = useState('');
  const [tag, setTag] = useState('');
  const { lectures, categories, tags, loading, error, removeLecture } = useLectures({ category, tag });

  return (
    <PageShell wide>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="label-mono mb-2">your lectures</p>
          <h1 className="font-display text-3xl font-semibold">
            Welcome back{user?.fullName ? `, ${user.fullName.split(' ')[0]}` : ''}
          </h1>
        </div>
        <Button variant="amber" className="shrink-0" onClick={() => navigate('/record')}>
          Record a lecture
        </Button>
      </div>

      <div className="mt-8 flex flex-col gap-6">
        {!loading && !error && (
          <FilterBar
            categories={categories}
            tags={tags}
            activeCategory={category}
            activeTag={tag}
            onCategoryChange={setCategory}
            onTagChange={setTag}
          />
        )}

        {loading && <LoadingSpinner label="Loading your lectures…" />}
        {error && <ErrorBanner message={error} />}

        {!loading && !error && lectures.length === 0 && (
          <Card className="p-10 text-center">
            <p className="font-display text-xl font-medium text-ink">
              {category || tag ? 'No lectures match this filter.' : 'No lectures yet.'}
            </p>
            <p className="mt-2 text-sm text-ink-muted">
              {category || tag
                ? 'Try a different category or tag.'
                : 'Record your first lecture to see it annotated here.'}
            </p>
            {!category && !tag && (
              <Button variant="amber" className="mt-5" onClick={() => navigate('/record')}>
                Record a lecture
              </Button>
            )}
          </Card>
        )}

        {!loading && !error && lectures.length > 0 && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {lectures.map((lecture) => (
              <LectureCard key={lecture._id} lecture={lecture} onDelete={removeLecture} />
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
}
