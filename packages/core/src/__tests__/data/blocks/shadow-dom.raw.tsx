import { useMetadata, useState, onMount, For, Show } from '@builder.io/mitosis';

useMetadata({ isAttachedToShadowDom: true });

type SmileReviewsProps = {
  productId: string;
  apiKey: string;
};

export default function SmileReviews(props: SmileReviewsProps) {
  const state = useState({
    reviews: [] as any[],
    name: 'test',
    showReviewPrompt: false,
  });

  // TODO: allow async function here
  onMount(() => {
    fetch(
      `https://stamped.io/api/widget/reviews?storeUrl=builder-io.myshopify.com&apiKey=${
        props.apiKey || 'pubkey-8bbDq7W6w4sB3OWeM1HUy2s47702hM'
      }&productId=${props.productId || '2410511106127'}`,
    )
      .then((res) => res.json())
      .then((data) => {
        state.reviews = data.data;
      });
  });

  return (
    <div data-user={state.name}>
      <button onClick={() => (state.showReviewPrompt = true)}>
        Write a review
      </button>
      <Show when={state.showReviewPrompt}>
        <input placeholder="Email" />

        <input css={{ display: 'block' }} placeholder="Title" />

        <textarea
          css={{ display: 'block' }}
          placeholder="How was your experience?"
        />
        <button
          css={{ display: 'block' }}
          onClick={() => {
            state.showReviewPrompt = false;
          }}
        >
          Submit
        </button>
      </Show>
      <For each={state.reviews}>
        {(review, index) => (
          <div
            $name="Review"
            key={review.id}
            css={{
              margin: '10px',
              padding: '10px',
              background: 'white',
              display: 'flex',
              borderRadius: '5px',
              boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
            }}
          >
            <img
              css={{ height: '30px', width: '30px', marginRight: '10px' }}
              src={review.avatar}
            />
            <div class={state.showReviewPrompt ? 'bg-primary' : 'bg-secondary'}>
              <div>N: {index}</div>
              <div>{review.author}</div>
              <div>{review.reviewMessage}</div>
            </div>
          </div>
        )}
      </For>
    </div>
  );
}
