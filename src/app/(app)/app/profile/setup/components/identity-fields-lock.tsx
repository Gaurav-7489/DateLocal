"use client";

import { useEffect } from "react";

export function IdentityFieldsLock({
  values,
}: {
  values: { displayName: string; dateOfBirth: string; gender: string; department: string; academicYear: string };
}) {
  useEffect(() => {
    const form = document.querySelector("form");
    if (!form) return;
    const fields: Array<[string, string]> = [
      ["display_name", values.displayName],
      ["date_of_birth", values.dateOfBirth],
      ["gender", values.gender],
      ["department", values.department],
      ["academic_year", values.academicYear],
    ];
    const hidden: HTMLInputElement[] = [];
    for (const [name, value] of fields) {
      const field = form.elements.namedItem(name);
      if (field instanceof HTMLInputElement || field instanceof HTMLSelectElement) {
        if (field instanceof HTMLInputElement) field.readOnly = true;
        else field.disabled = true;
        field.setAttribute("aria-readonly", "true");
        field.classList.add("opacity-65", "cursor-not-allowed");
      }
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = name;
      input.value = value;
      form.appendChild(input);
      hidden.push(input);
    }
    return () => hidden.forEach((input) => input.remove());
  }, [values]);

  return (
    <div className="mb-5 rounded-2xl border border-[var(--line)] bg-[var(--bg)] p-3.5">
      <p className="text-xs font-semibold">Shared identity is managed by Extrovert</p>
      <p className="mt-1 text-[11px] leading-5 text-[var(--muted)]">
        Name, birthday, gender and student identity are read-only here. Edit them in Extrovert so verification and both apps stay in sync.
      </p>
    </div>
  );
}
