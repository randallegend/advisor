"use client";

import { useState } from "react";
import { User, Lock, Trash2, Check, AlertTriangle, Eye, EyeOff } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { updateProfile, changePassword, deleteAccount } from "@/app/(auth)/actions";

interface SettingsProps {
  user: {
    email?: string;
    user_metadata?: {
      full_name?: string;
    };
  };
  onSignOut: () => void;
}

export default function Settings({ user, onSignOut }: SettingsProps) {
  // Profile state
  const [fullName, setFullName] = useState(user.user_metadata?.full_name || "");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Delete account state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const handleUpdateProfile = async () => {
    if (!fullName.trim()) return;

    setIsUpdatingProfile(true);
    setProfileMessage(null);

    const result = await updateProfile(fullName.trim());

    if (result.success) {
      setProfileMessage({ type: "success", text: "Profile updated successfully!" });
    } else {
      setProfileMessage({ type: "error", text: result.error || "Failed to update profile" });
    }

    setIsUpdatingProfile(false);
    setTimeout(() => setProfileMessage(null), 3000);
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordMessage({ type: "error", text: "Please fill in all fields" });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: "error", text: "New passwords do not match" });
      return;
    }

    if (newPassword.length < 6) {
      setPasswordMessage({ type: "error", text: "Password must be at least 6 characters" });
      return;
    }

    setIsChangingPassword(true);
    setPasswordMessage(null);

    const result = await changePassword(currentPassword, newPassword);

    if (result.success) {
      setPasswordMessage({ type: "success", text: "Password changed successfully!" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } else {
      setPasswordMessage({ type: "error", text: result.error || "Failed to change password" });
    }

    setIsChangingPassword(false);
    setTimeout(() => setPasswordMessage(null), 3000);
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE") return;

    setIsDeleting(true);
    const result = await deleteAccount();

    if (result.success) {
      onSignOut();
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-[#3C0E66]">Settings</h2>
        <p className="text-[#561493]/70 mt-1">Manage your account preferences</p>
      </div>

      {/* Profile Section */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#701AC0] to-[#8A2BE2] flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#3C0E66]">Profile</h3>
            <p className="text-sm text-[#561493]/60">Update your personal information</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#3C0E66] mb-2">Email</label>
            <input
              type="email"
              value={user.email || ""}
              disabled
              className="w-full px-4 py-3 rounded-xl bg-[#F8F2FE] border border-[#D4B2F4]/50 text-[#561493]/60 cursor-not-allowed"
            />
            <p className="text-xs text-[#561493]/50 mt-1">Email cannot be changed</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#3C0E66] mb-2">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
              className="w-full px-4 py-3 rounded-xl bg-white/50 border border-[#D4B2F4]/50 text-[#3C0E66] placeholder-[#561493]/40 focus:outline-none focus:ring-2 focus:ring-[#8A2BE2]/50 focus:border-transparent transition-all"
            />
          </div>

          {profileMessage && (
            <div className={`flex items-center gap-2 px-4 py-3 rounded-xl ${
              profileMessage.type === "success"
                ? "bg-[#ECFDF5] text-[#10B981]"
                : "bg-red-50 text-red-600"
            }`}>
              {profileMessage.type === "success" ? (
                <Check className="w-4 h-4" />
              ) : (
                <AlertTriangle className="w-4 h-4" />
              )}
              <span className="text-sm font-medium">{profileMessage.text}</span>
            </div>
          )}

          <button
            onClick={handleUpdateProfile}
            disabled={isUpdatingProfile || !fullName.trim()}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[#701AC0] to-[#8A2BE2] hover:from-[#561493] hover:to-[#701AC0] transition-all shadow-lg shadow-[#8A2BE2]/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isUpdatingProfile ? (
              <>
                <Spinner className="w-4 h-4" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </div>

      {/* Security Section */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0891B2] to-[#06B6D4] flex items-center justify-center">
            <Lock className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#3C0E66]">Security</h3>
            <p className="text-sm text-[#561493]/60">Update your password</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#3C0E66] mb-2">Current Password</label>
            <div className="relative">
              <input
                type={showCurrentPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="w-full px-4 py-3 pr-12 rounded-xl bg-white/50 border border-[#D4B2F4]/50 text-[#3C0E66] placeholder-[#561493]/40 focus:outline-none focus:ring-2 focus:ring-[#0891B2]/50 focus:border-transparent transition-all"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#561493]/50 hover:text-[#561493] transition-colors"
              >
                {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#3C0E66] mb-2">New Password</label>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full px-4 py-3 pr-12 rounded-xl bg-white/50 border border-[#D4B2F4]/50 text-[#3C0E66] placeholder-[#561493]/40 focus:outline-none focus:ring-2 focus:ring-[#0891B2]/50 focus:border-transparent transition-all"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#561493]/50 hover:text-[#561493] transition-colors"
              >
                {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#3C0E66] mb-2">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="w-full px-4 py-3 rounded-xl bg-white/50 border border-[#D4B2F4]/50 text-[#3C0E66] placeholder-[#561493]/40 focus:outline-none focus:ring-2 focus:ring-[#0891B2]/50 focus:border-transparent transition-all"
            />
          </div>

          {passwordMessage && (
            <div className={`flex items-center gap-2 px-4 py-3 rounded-xl ${
              passwordMessage.type === "success"
                ? "bg-[#ECFDF5] text-[#10B981]"
                : "bg-red-50 text-red-600"
            }`}>
              {passwordMessage.type === "success" ? (
                <Check className="w-4 h-4" />
              ) : (
                <AlertTriangle className="w-4 h-4" />
              )}
              <span className="text-sm font-medium">{passwordMessage.text}</span>
            </div>
          )}

          <button
            onClick={handleChangePassword}
            disabled={isChangingPassword || !currentPassword || !newPassword || !confirmPassword}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[#0891B2] to-[#06B6D4] hover:from-[#0e7490] hover:to-[#0891B2] transition-all shadow-lg shadow-[#0891B2]/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isChangingPassword ? (
              <>
                <Spinner className="w-4 h-4" />
                Changing...
              </>
            ) : (
              "Change Password"
            )}
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="glass rounded-2xl p-6 border border-rose-200/60">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-400 to-rose-500 flex items-center justify-center">
            <Trash2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-rose-600">Danger Zone</h3>
            <p className="text-sm text-rose-400">Irreversible actions</p>
          </div>
        </div>

        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-all"
          >
            Delete Account
          </button>
        ) : (
          <div className="space-y-4 p-4 rounded-xl bg-rose-50/70 border border-rose-200">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-rose-700">Are you sure you want to delete your account?</p>
                <p className="text-sm text-rose-500/80 mt-1">
                  This will permanently delete all your campaigns and data. This action cannot be undone.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-rose-600 mb-2">
                Type <span className="font-bold">DELETE</span> to confirm
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="DELETE"
                className="w-full px-4 py-3 rounded-xl bg-white border border-rose-200 text-rose-600 placeholder-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-400/50 focus:border-transparent transition-all"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteConfirmText("");
                }}
                className="px-4 py-2 rounded-xl text-sm font-medium text-[#561493] hover:bg-[#F0E5FC] transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== "DELETE" || isDeleting}
                className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-rose-500 hover:bg-rose-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <Spinner className="w-4 h-4" />
                    Deleting...
                  </>
                ) : (
                  "Delete My Account"
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
