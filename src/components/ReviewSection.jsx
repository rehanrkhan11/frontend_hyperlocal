import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import AuthModal from './AuthModal.jsx';

const STARS = [1, 2, 3, 4, 5];

function StarPicker({ value, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {STARS.map((s) => (
        <button
          key={s}
          type="button"
          onMouseEnter={() => setHover(s)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(s)}
          className={`text-2xl transition-colors leading-none
            ${s <= (hover || value) ? 'text-amber-400' : 'text-stone-200'}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

function ReviewCard({ review, onDelete, canDelete }) {
  const stars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
  const date  = new Date(review.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
  return (
    <div className="py-4 border-b border-stone-100 last:border-0">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-stone-800">{review.user?.name ?? 'Anonymous'}</p>
          <p className="text-xs text-stone-400">{date}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-amber-400 text-sm tracking-tight">{stars}</span>
          {canDelete && (
            <button onClick={() => onDelete(review._id)}
              className="text-stone-300 hover:text-red-400 text-xs transition-colors ml-1">
              ✕
            </button>
          )}
        </div>
      </div>
      {review.comment && (
        <p className="text-sm text-stone-500 mt-2 leading-relaxed">{review.comment}</p>
      )}
    </div>
  );
}

export default function ReviewSection({ shopId }) {
  const { user, token } = useAuth();
  const [reviews,   setReviews]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [showForm,  setShowForm]  = useState(false);
  const [showAuth,  setShowAuth]  = useState(false);
  const [rating,    setRating]    = useState(0);
  const [comment,   setComment]   = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error,     setError]     = useState('');

  const fetchReviews = () => {
    fetch(`/api/shops/${shopId}/reviews`)
      .then((r) => r.json())
      .then((d) => { setReviews(d.reviews ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchReviews(); }, [shopId]);

  const alreadyReviewed = user && reviews.some((r) => r.user?._id === user.id || r.user?.id === user.id);

  const handleSubmit = async () => {
    if (!rating) { setError('Please select a star rating.'); return; }
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch(`/api/shops/${shopId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ rating, comment }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit.');
      setReviews((r) => [data.review, ...r]);
      setRating(0);
      setComment('');
      setShowForm(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (reviewId) => {
    try {
      const res = await fetch(`/api/shops/${shopId}/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      setReviews((r) => r.filter((rv) => rv._id !== reviewId));
    } catch {
      // silent
    }
  };

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <section className="bg-white border border-stone-100 rounded-2xl p-5 mt-5">

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="font-serif text-lg font-bold">Reviews</h2>
          {avgRating && (
            <p className="text-xs text-stone-400 mt-0.5">
              <span className="text-amber-400">★</span> {avgRating} · {reviews.length} review{reviews.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {!alreadyReviewed && (
          <button
            onClick={() => user ? setShowForm((v) => !v) : setShowAuth(true)}
            className={`text-xs px-4 py-2 rounded-full border transition-all
              ${showForm
                ? 'bg-stone-900 text-white border-stone-900'
                : 'border-stone-200 text-stone-600 hover:border-stone-400'}`}
          >
            {showForm ? 'Cancel' : '+ Write a review'}
          </button>
        )}
      </div>

      {/* Write review form */}
      {showForm && (
        <div className="bg-stone-50 rounded-xl p-4 mb-5 border border-stone-100">
          <p className="text-xs uppercase tracking-wide text-stone-400 mb-2">Your Rating</p>
          <StarPicker value={rating} onChange={setRating} />
          <textarea
            className="mt-3 w-full border border-stone-200 rounded-xl px-4 py-3 text-sm bg-white
                       focus:outline-none focus:border-stone-400 resize-none h-24 placeholder:text-stone-300"
            placeholder="Share your experience… (optional)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={600}
          />
          {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="mt-3 w-full bg-stone-900 text-white text-sm py-2.5 rounded-xl
                       hover:bg-stone-700 transition-colors disabled:opacity-40"
          >
            {submitting ? 'Submitting…' : 'Submit Review →'}
          </button>
        </div>
      )}

      {/* Review list */}
      {loading && (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-12 bg-stone-100 rounded-xl animate-pulse" />
          ))}
        </div>
      )}

      {!loading && reviews.length === 0 && (
        <p className="text-sm text-stone-400 text-center py-6">
          No reviews yet. Be the first to share your experience!
        </p>
      )}

      {!loading && reviews.length > 0 && (
        <div>
          {reviews.map((rv) => (
            <ReviewCard
              key={rv._id}
              review={rv}
              canDelete={user && (rv.user?._id === user.id || rv.user?.id === user.id || user.role === 'admin')}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </section>
  );
}
