"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  MoreHorizontal,
  Eye,
  Share2,
  Edit,
  Phone,
  Mail,
  Calendar,
  Download,
  History,
  Link2,
  UserX,
  UserCheck,
  Trash2,
} from "lucide-react"

export function CandidateActionMenu({
  candidate,
  allowedMap = {},
  sessionUser = null,
  onViewDetails,
  onShareInfo,
  onEdit,
  onScheduleInterview,
  onHistory,
  onActivateCvLink,
  onDeactivateCvLink,
  onMarkInactive,
  onActivate,
  onDelete,
  onDownloadResume,
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {allowedMap.action_view_details !== false && (
          <DropdownMenuItem onClick={onViewDetails}>
            <Eye className="w-4 h-4 mr-2" /> View Details
          </DropdownMenuItem>
        )}
        {allowedMap.action_share_info !== false && (
          <DropdownMenuItem onClick={onShareInfo}>
            <Share2 className="w-4 h-4 mr-2" /> Share info
          </DropdownMenuItem>
        )}
        {allowedMap.action_edit !== false && (
          <DropdownMenuItem onClick={onEdit}>
            <Edit className="w-4 h-4 mr-2" /> Edit
          </DropdownMenuItem>
        )}
        {allowedMap.action_call !== false && (
          <DropdownMenuItem asChild>
            <a href={`tel:${candidate.phone}`}>
              <Phone className="w-4 h-4 mr-2" /> Call
            </a>
          </DropdownMenuItem>
        )}
        {allowedMap.action_email !== false && (
          <DropdownMenuItem asChild>
            <a href={candidate.email ? `mailto:${candidate.email}` : "#"}>
              <Mail className="w-4 h-4 mr-2" /> Email
            </a>
          </DropdownMenuItem>
        )}
        {allowedMap.action_schedule_interview !== false && (
          <DropdownMenuItem onClick={onScheduleInterview} disabled={candidate.isActive === false}>
            <Calendar className="w-4 h-4 mr-2" /> Schedule Interview
          </DropdownMenuItem>
        )}
        {allowedMap.action_download_resume !== false && (
          <DropdownMenuItem onClick={onDownloadResume} disabled={!candidate.resume}>
            <Download className="w-4 h-4 mr-2" /> Download Resume
          </DropdownMenuItem>
        )}
        {allowedMap.action_history !== false && (
          <DropdownMenuItem onClick={onHistory}>
            <History className="w-4 h-4 mr-2" /> History
          </DropdownMenuItem>
        )}
        {allowedMap.action_activate_cv_link !== false && (
          <DropdownMenuItem onClick={onActivateCvLink}>
            <Link2 className="w-4 h-4 mr-2" /> Activate CV Link
          </DropdownMenuItem>
        )}
        {allowedMap.action_deactivate_cv_link !== false && (
          <DropdownMenuItem onClick={onDeactivateCvLink}>
            <Link2 className="w-4 h-4 mr-2" /> Deactivate CV Link
          </DropdownMenuItem>
        )}
        {allowedMap.action_mark_inactive !== false && candidate.isActive !== false && (
          <DropdownMenuItem onClick={onMarkInactive}>
            <UserX className="w-4 h-4 mr-2" /> Mark inactive
          </DropdownMenuItem>
        )}
        {allowedMap.action_activate !== false && candidate.isActive === false && 
          (sessionUser?.id === candidate.inactivatedByAdminUserId || sessionUser?.role === "super_admin") && (
          <DropdownMenuItem onClick={onActivate}>
            <UserCheck className="w-4 h-4 mr-2" /> Activate
          </DropdownMenuItem>
        )}
        {allowedMap.action_delete !== false && (
          <DropdownMenuItem className="text-red-600" onClick={onDelete}>
            <Trash2 className="w-4 h-4 mr-2" /> Delete
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
