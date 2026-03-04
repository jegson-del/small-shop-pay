import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
} from '@tanstack/react-query';
import { tokenStore } from '@/api/tokenStore';
import * as authApi from '@/api/auth';
import type { User, LoginResponse, RegisterResponse } from '@/schemas/auth';

export const authKeys = {
  me: ['me'] as const,
};

/** Current user – enabled only when tokens exist */
export function useMeQuery(
  options?: Omit<UseQueryOptions<User, Error>, 'queryKey' | 'queryFn' | 'enabled'>
) {
  const hasTokens = tokenStore.hasTokens();

  return useQuery({
    queryKey: authKeys.me,
    queryFn: authApi.getMe,
    enabled: hasTokens,
    ...options,
  });
}

/** Login mutation – sets tokens and invalidates me on success */
export function useLoginMutation(
  options?: UseMutationOptions<LoginResponse, Error, { email: string; password: string }>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ email, password }) => authApi.login(email, password),
    onSuccess: (data, variables, onMutateResult, context) => {
      tokenStore.setTokens(data.access_token, data.refresh_token);
      queryClient.invalidateQueries({ queryKey: authKeys.me });
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
    ...options,
  });
}

/** Register mutation */
export function useRegisterMutation(
  options?: UseMutationOptions<
    RegisterResponse,
    Error,
    { email: string; password: string; terms_accepted: boolean; privacy_accepted: boolean }
  >
) {
  return useMutation({
    mutationFn: authApi.register,
    ...options,
  });
}

/** Logout mutation – clears tokens and invalidates me */
export function useLogoutMutation(options?: UseMutationOptions<void, Error, void>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.removeQueries({ queryKey: authKeys.me });
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
    ...options,
  });
}
