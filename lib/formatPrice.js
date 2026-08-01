// export const formatPrice = (price) => {
//   return Intl.NumberFormat("en-us", {
//     style: "currency",
//     currency: "USD",
//   }).format(price);
// };

export const formatPrice = (price) => {
    return new Intl.NumberFormat('fa-IR').format(price) + ' تومان';
};

/**
 * The real price to charge/display for a course: the discount price if one
 * is set and it's actually lower than the base price, otherwise the base
 * price. Centralized here so the payment flow (Zarinpal request +
 * verification) and every UI price display always agree on the same
 * number — a mismatch between what's shown and what's charged would break
 * Zarinpal's payment verification (it requires the exact original amount).
 */
export const getEffectivePrice = (course) => {
    const price = Number(course?.price) || 0;
    if (!hasActiveDiscount(course)) return price;
    return Number(course.discountPrice);
};

export const hasActiveDiscount = (course) => {
    const price = Number(course?.price) || 0;
    const discountPrice = course?.discountPrice != null ? Number(course.discountPrice) : null;

    if (discountPrice == null || discountPrice <= 0 || discountPrice >= price) {
        return false;
    }

    // If an expiry is set, the discount is only active until that moment —
    // after that it silently reverts to the normal price everywhere
    // (course cards, course page, and the actual checkout amount).
    if (course?.discountEndsAt && new Date(course.discountEndsAt).getTime() <= Date.now()) {
        return false;
    }

    return true;
};
