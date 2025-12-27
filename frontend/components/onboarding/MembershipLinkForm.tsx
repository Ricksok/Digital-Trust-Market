'use client';

import { useForm } from 'react-hook-form';
import { MembershipLinkageInput } from '@/lib/api/onboarding';
import { useLinkMembership } from '@/lib/queries';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function MembershipLinkForm() {
  const linkMembership = useLinkMembership();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MembershipLinkageInput>();

  const onSubmit = (data: MembershipLinkageInput) => {
    linkMembership.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="organizationType" className="block text-sm font-medium text-gray-700 mb-2">
          Organization Type
        </label>
        <select
          {...register('organizationType', { required: 'Organization type is required' })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
        >
          <option value="">Select organization type</option>
          <option value="COOP">Co-operative</option>
          <option value="SACCO">SACCO</option>
        </select>
        {errors.organizationType && (
          <p className="mt-1 text-sm text-red-600">{errors.organizationType.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="organizationId" className="block text-sm font-medium text-gray-700 mb-2">
          Organization ID
        </label>
        <Input
          {...register('organizationId', { required: 'Organization ID is required' })}
          type="text"
          placeholder="Enter organization ID"
        />
        {errors.organizationId && (
          <p className="mt-1 text-sm text-red-600">{errors.organizationId.message}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          The unique identifier for your co-op or SACCO
        </p>
      </div>

      <div>
        <label htmlFor="membershipNumber" className="block text-sm font-medium text-gray-700 mb-2">
          Membership Number
        </label>
        <Input
          {...register('membershipNumber', { required: 'Membership number is required' })}
          type="text"
          placeholder="Enter your membership number"
        />
        {errors.membershipNumber && (
          <p className="mt-1 text-sm text-red-600">{errors.membershipNumber.message}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Your personal membership number in the organization
        </p>
      </div>

      <Button
        type="submit"
        variant="primary"
        disabled={linkMembership.isPending}
        fullWidth
      >
        {linkMembership.isPending ? 'Linking...' : 'Link Membership'}
      </Button>
    </form>
  );
}

