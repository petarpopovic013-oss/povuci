export interface AdminApiResponse {
  success: boolean;
  error?: string;
  message?: string;
  trailerId?: string;
}

export async function readAdminApiResponse(
  response: Response
): Promise<AdminApiResponse> {
  const responseText = await response.text();

  if (responseText) {
    try {
      return JSON.parse(responseText) as AdminApiResponse;
    } catch {
      // Proxies and hosting providers can return plain text or HTML before a
      // Next.js route runs. Do not expose that response as a JSON parse error.
    }
  }

  if (
    response.status === 413 ||
    /request entity too large|payload too large/i.test(responseText)
  ) {
    return {
      success: false,
      error: "Fotografija je prevelika za slanje. Izaberite manju fotografiju i pokušajte ponovo.",
    };
  }

  if (response.status === 401 || response.status === 403) {
    return {
      success: false,
      error: "Administratorska sesija je istekla. Prijavite se ponovo.",
    };
  }

  return {
    success: false,
    error: `Server nije vratio ispravan odgovor (${response.status}). Pokušajte ponovo.`,
  };
}
