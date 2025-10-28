import { supabase } from "@/integrations/supabase/client";

export interface Customer {
  id: string;
  full_name: string;
  phone?: string;
  email?: string;
  customer_type?: string;
  national_id?: string;
  passport_number?: string;
}

export interface CustomerSearchResult extends Customer {
  match_score: number;
  match_field: string;
}

/**
 * Search for customers by name with fuzzy matching
 * Returns up to 10 results ranked by relevance
 */
export async function searchCustomerByName(name: string): Promise<CustomerSearchResult[]> {
  if (!name || name.trim().length < 2) {
    return [];
  }

  const searchTerm = name.trim().toLowerCase();
  
  try {
    // Query customers table with ILIKE for case-insensitive partial matching
    const { data: customers, error } = await supabase
      .from('customers')
      .select('id, full_name, phone, email, customer_type, national_id, passport_number')
      .or(`full_name.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,national_id.ilike.%${searchTerm}%,passport_number.ilike.%${searchTerm}%`)
      .limit(10);

    if (error) {
      console.error('[CustomerSearch] Error searching customers:', error);
      throw error;
    }

    if (!customers || customers.length === 0) {
      return [];
    }

    // Rank results by match quality
    const rankedResults: CustomerSearchResult[] = customers.map(customer => {
      let matchScore = 0;
      let matchField = 'other';

      const fullNameLower = customer.full_name?.toLowerCase() || '';
      const phoneLower = customer.phone?.toLowerCase() || '';
      const emailLower = customer.email?.toLowerCase() || '';
      const nationalIdLower = customer.national_id?.toLowerCase() || '';

      // Exact match gets highest score
      if (fullNameLower === searchTerm) {
        matchScore = 100;
        matchField = 'full_name_exact';
      } else if (fullNameLower.startsWith(searchTerm)) {
        matchScore = 90;
        matchField = 'full_name_prefix';
      } else if (phoneLower.includes(searchTerm)) {
        matchScore = 85;
        matchField = 'phone';
      } else if (nationalIdLower.includes(searchTerm)) {
        matchScore = 80;
        matchField = 'national_id';
      } else if (fullNameLower.includes(searchTerm)) {
        matchScore = 75;
        matchField = 'full_name_partial';
      } else if (emailLower.includes(searchTerm)) {
        matchScore = 60;
        matchField = 'email';
      } else {
        matchScore = 50;
        matchField = 'other';
      }

      return {
        ...customer,
        match_score: matchScore,
        match_field: matchField,
      };
    });

    // Sort by match score descending
    rankedResults.sort((a, b) => b.match_score - a.match_score);

    console.log(`[CustomerSearch] Found ${rankedResults.length} results for "${name}"`);
    return rankedResults;

  } catch (error) {
    console.error('[CustomerSearch] Search failed:', error);
    throw error;
  }
}

/**
 * Find the best matching customer by name
 * Returns the highest-ranked match or null if no good match found
 */
export async function findBestCustomerMatch(name: string): Promise<Customer | null> {
  const results = await searchCustomerByName(name);
  
  if (results.length === 0) {
    console.log(`[CustomerSearch] No matches found for "${name}"`);
    return null;
  }

  // Return the top result if it's a strong match (score >= 70)
  const topMatch = results[0];
  
  if (topMatch.match_score >= 70) {
    console.log(`[CustomerSearch] Best match for "${name}":`, {
      id: topMatch.id,
      name: topMatch.full_name,
      score: topMatch.match_score,
      field: topMatch.match_field
    });
    return topMatch;
  }

  // If top match is weak, return null to indicate ambiguity
  console.log(`[CustomerSearch] Weak match (${topMatch.match_score}) for "${name}", returning null`);
  return null;
}

/**
 * Get customer by ID (for hydration/verification)
 */
export async function getCustomerById(customerId: string): Promise<Customer | null> {
  try {
    const { data: customer, error } = await supabase
      .from('customers')
      .select('id, full_name, phone, email, customer_type, national_id, passport_number')
      .eq('id', customerId)
      .single();

    if (error) {
      console.error('[CustomerSearch] Error fetching customer by ID:', error);
      return null;
    }

    return customer;
  } catch (error) {
    console.error('[CustomerSearch] Failed to get customer by ID:', error);
    return null;
  }
}
