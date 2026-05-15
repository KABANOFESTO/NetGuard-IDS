import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import type { SerializedError } from "@reduxjs/toolkit";

type ErrorPayload = {
  error?: string;
  message?: string;
  detail?: string;
  email?: string[] | string;
  password?: string[] | string;
  current_password?: string[] | string;
  new_password?: string[] | string;
  non_field_errors?: string[] | string;
};

function firstMessage(value?: string[] | string) {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

export function isFetchBaseQueryError(error: unknown): error is FetchBaseQueryError {
  return typeof error === "object" && error !== null && "status" in error;
}

export function isSerializedError(error: unknown): error is SerializedError {
  return typeof error === "object" && error !== null && ("message" in error || "code" in error);
}

export function getApiErrorMessage(error: unknown, fallback: string) {
  if (isFetchBaseQueryError(error)) {
    const payload = error.data as ErrorPayload | string | undefined;

    if (typeof payload === "string") {
      return payload;
    }

    return (
      payload?.error ??
      payload?.message ??
      firstMessage(payload?.email) ??
      firstMessage(payload?.password) ??
      firstMessage(payload?.current_password) ??
      firstMessage(payload?.new_password) ??
      firstMessage(payload?.non_field_errors) ??
      payload?.detail ??
      fallback
    );
  }

  if (isSerializedError(error)) {
    return error.message ?? fallback;
  }

  return fallback;
}
