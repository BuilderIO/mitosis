import { useState, onMount, For } from '@jsx-lite/core';

type SmileReviewsProps = {
  productId: string;
  apiKey: string;
};

export default function SmileReviews(props: SmileReviewsProps) {
  const state = useState({
    reviews: [] as any[],
    addReview: () => {
      // Hello
    },
  });

  // TODO: allow async function here
  onMount(() => {
    fetch(
      `https://stamped.io/api/widget/reviews?storeUrl=builder-io.myshopify.com&apiKey=${props.apiKey ||
        'pubkey-8bbDq7W6w4sB3OWeM1HUy2s47702hM'}&productId=${props.productId ||
        '2410511106127'}`,
    )
      .then((res) => res.json())
      .then((data) => {
        state.reviews = data.data;
      });
  });

  return (
    <div>
      <For each={state.reviews}>
        {(review) => (
          <div css={{ margin: '10px', padding: '10px', background: 'white' }}>
            {review.reviewMessage}
          </div>
        )}
      </For>
    </div>
  );
}
