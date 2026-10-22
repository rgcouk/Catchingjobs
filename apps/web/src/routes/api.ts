import type { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router';
import { forwardApi } from '../framework/api.server';

export function loader({ request }: LoaderFunctionArgs) {
  return forwardApi(request);
}

export function action({ request }: ActionFunctionArgs) {
  return forwardApi(request);
}
