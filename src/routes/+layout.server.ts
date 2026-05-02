export const load = async ({ locals }) => {
	const session = locals.session;

	return { session };
};
