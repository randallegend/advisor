"use server";

import { createClient } from "@/lib/supabase/server";
import type { TrendSignal, TargetAudience, AdFormat, FunnelBudget, StrategyRationale, CampaignStrategist } from "@/lib/types";
import type { CampaignKPIs } from "@/lib/kpiHelpers";

export interface SaveCampaignData {
  prompt: string;
  strategist: CampaignStrategist;
  budget: number;
  keywords: string[];
  location: string;
  signals: TrendSignal;
  signalSource: "data" | "ai";
  funnelBudget: FunnelBudget;
  kpis: CampaignKPIs;
  audiences: TargetAudience[];
  adFormats: AdFormat[];
  strategyRationale: StrategyRationale[];
  chatMessages: Array<{ role: "user" | "assistant"; content: string }>;
  status: "draft" | "finished";
}

export async function saveCampaignDraft(data: SaveCampaignData, campaignId?: string) {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: "User not authenticated" };
    }

    const campaignData = {
      user_id: user.id,
      status: data.status,
      prompt: data.prompt,
      strategist_id: data.strategist.id,
      strategist_name: data.strategist.name,
      strategist_title: data.strategist.title,
      strategist_avatar: data.strategist.avatar,
      budget: data.budget,
      keywords: data.keywords,
      location: data.location,
      signals: data.signals,
      signal_source: data.signalSource,
      funnel_budget: data.funnelBudget,
      kpis: data.kpis,
      audiences: data.audiences,
      ad_formats: data.adFormats,
      strategy_rationale: data.strategyRationale,
      updated_at: new Date().toISOString(),
    };

    let savedCampaignId: string;

    if (campaignId) {
      // Update existing campaign
      const { data: campaign, error: updateError } = await supabase
        .from("campaigns")
        .update(campaignData)
        .eq("id", campaignId)
        .eq("user_id", user.id)
        .select()
        .single();

      if (updateError) {
        console.error("Update campaign error:", updateError);
        return { success: false, error: updateError.message };
      }

      savedCampaignId = campaign.id;
    } else {
      // Create new campaign
      const { data: campaign, error: insertError } = await supabase
        .from("campaigns")
        .insert(campaignData)
        .select()
        .single();

      if (insertError) {
        console.error("Insert campaign error:", insertError);
        return { success: false, error: insertError.message };
      }

      savedCampaignId = campaign.id;
    }

    // Save chat messages
    if (data.chatMessages.length > 0) {
      // Delete existing messages for this campaign
      await supabase
        .from("campaign_messages")
        .delete()
        .eq("campaign_id", savedCampaignId);

      // Insert new messages
      const messages = data.chatMessages.map((msg, idx) => ({
        campaign_id: savedCampaignId,
        role: msg.role,
        content: msg.content,
        order_index: idx,
      }));

      const { error: messagesError } = await supabase
        .from("campaign_messages")
        .insert(messages);

      if (messagesError) {
        console.error("Insert messages error:", messagesError);
        return { success: false, error: messagesError.message };
      }
    }

    return { success: true, campaignId: savedCampaignId };
  } catch (error) {
    console.error("Save campaign error:", error);
    return { success: false, error: String(error) };
  }
}

export async function getCampaign(campaignId: string) {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: "User not authenticated" };
    }

    // Get campaign
    const { data: campaign, error: campaignError } = await supabase
      .from("campaigns")
      .select("*")
      .eq("id", campaignId)
      .eq("user_id", user.id)
      .single();

    if (campaignError) {
      console.error("Get campaign error:", campaignError);
      return { success: false, error: campaignError.message };
    }

    // Get messages
    const { data: messages, error: messagesError } = await supabase
      .from("campaign_messages")
      .select("*")
      .eq("campaign_id", campaignId)
      .order("order_index", { ascending: true });

    if (messagesError) {
      console.error("Get messages error:", messagesError);
      return { success: false, error: messagesError.message };
    }

    return {
      success: true,
      data: {
        ...campaign,
        messages: messages.map(msg => ({
          role: msg.role as "user" | "assistant",
          content: msg.content,
        })),
      },
    };
  } catch (error) {
    console.error("Get campaign error:", error);
    return { success: false, error: String(error) };
  }
}

export async function getUserCampaigns() {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: "User not authenticated" };
    }

    // Get campaigns
    const { data: campaigns, error: campaignsError } = await supabase
      .from("campaigns")
      .select("id, prompt, status, created_at, updated_at")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });

    if (campaignsError) {
      console.error("Get campaigns error:", campaignsError);
      return { success: false, error: campaignsError.message };
    }

    return { success: true, data: campaigns };
  } catch (error) {
    console.error("Get campaigns error:", error);
    return { success: false, error: String(error) };
  }
}

export async function deleteCampaign(campaignId: string) {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: "User not authenticated" };
    }

    // Delete campaign (messages will cascade delete)
    const { error: deleteError } = await supabase
      .from("campaigns")
      .delete()
      .eq("id", campaignId)
      .eq("user_id", user.id);

    if (deleteError) {
      console.error("Delete campaign error:", deleteError);
      return { success: false, error: deleteError.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Delete campaign error:", error);
    return { success: false, error: String(error) };
  }
}

export async function updateCampaignStatus(campaignId: string, status: "draft" | "finished") {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: "User not authenticated" };
    }

    // Update status
    const { error: updateError } = await supabase
      .from("campaigns")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", campaignId)
      .eq("user_id", user.id);

    if (updateError) {
      console.error("Update status error:", updateError);
      return { success: false, error: updateError.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Update status error:", error);
    return { success: false, error: String(error) };
  }
}
