import type { CSSProperties, SVGProps } from "react";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import {
  Activity01Icon,
  Add01Icon,
  AlertCircleIcon,
  AppWindowIcon,
  Archive01Icon,
  ArchiveRestoreIcon,
  ArrowDown01Icon,
  ArrowUp01Icon,
  ArrowUpDownIcon,
  ArrowUpRight01Icon,
  AtSignIcon,
  BellIcon,
  BookOpen01Icon,
  BotIcon,
  Camera01Icon,
  Cancel01Icon,
  CheckCheckIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CircleCheckIcon,
  ClipboardPasteIcon,
  Clock01Icon,
  CloudDownloadIcon,
  CodeIcon,
  Copy01Icon,
  Database01Icon,
  Delete02Icon,
  DotIcon,
  Download01Icon,
  ExternalLinkIcon,
  EyeIcon,
  EyeOffIcon,
  FileDiffIcon,
  FileSpreadsheetIcon,
  FileTextIcon,
  Folder01Icon,
  FolderOpenIcon,
  FolderPlusIcon,
  GitForkIcon,
  GitPullRequestArrowIcon,
  Globe02Icon,
  GripVerticalIcon,
  HelpCircleIcon,
  Image01Icon,
  InformationCircleIcon,
  KeyboardIcon,
  KeyRoundIcon,
  Link01Icon,
  ListChecksIcon,
  LogOutIcon,
  Maximize01Icon,
  MessageSquareIcon,
  MessageSquarePlusIcon,
  Mic01Icon,
  Minimize01Icon,
  MinusSignIcon,
  MonitorIcon,
  Moon01Icon,
  MoreHorizontalIcon,
  Music01Icon,
  PaletteIcon,
  PanelLeftIcon,
  PanelRightIcon,
  PanelRightOpenIcon,
  PawPrintIcon,
  PencilLineIcon,
  PinIcon,
  PlayIcon,
  Plug01Icon,
  PowerIcon,
  RefreshCcwIcon,
  RefreshCwIcon,
  RotateCwIcon,
  Search01Icon,
  ServerIcon,
  Settings01Icon,
  Shield01Icon,
  SlashIcon,
  SlidersHorizontalIcon,
  SmileIcon,
  SparklesIcon,
  SquareIcon,
  SquareTerminalIcon,
  StarIcon,
  StopIcon,
  Sun01Icon,
  Target01Icon,
  TextSelectIcon,
  TriangleAlertIcon,
  Undo02Icon,
  UserRoundIcon,
  Video01Icon,
  WebhookIcon,
  WorkflowIcon,
  Wrench01Icon,
} from "@hugeicons/core-free-icons";

export interface IconProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
  strokeWidth?: number;
  color?: string;
}

/**
 * Sizes are fixed px attributes. Multiply them by `--font-scale` so
 * chrome glyphs stay in proportion with the Appearance type scale (D343).
 */
function scaledIconBox(size: IconProps["size"] = 16): string {
  if (typeof size === "number" && Number.isFinite(size)) {
    return `calc(${size}px * var(--font-scale))`;
  }
  if (typeof size === "string" && size.trim()) {
    const value = size.trim();
    return /[a-z%]+$/i.test(value)
      ? `calc(${value} * var(--font-scale))`
      : `calc(${value}px * var(--font-scale))`;
  }
  return "calc(16px * var(--font-scale))";
}

function withScaledIconStyle(
  size: IconProps["size"],
  style?: CSSProperties,
): CSSProperties {
  const box = scaledIconBox(size);
  return { width: box, height: box, ...style };
}

/* Defaults (16px, 1.75 stroke) match the app's clean iconography. */
function icon(hugeIcon: IconSvgElement) {
  return function Icon({
    size = 16,
    style,
    strokeWidth = 1.75,
    color = "currentColor",
    ...props
  }: IconProps) {
    return (
      <HugeiconsIcon
        icon={hugeIcon}
        size={size}
        color={color}
        strokeWidth={typeof strokeWidth === "number" ? strokeWidth : 1.75}
        {...props}
        style={withScaledIconStyle(size, style)}
      />
    );
  };
}

export const IconPlus = icon(Add01Icon);
export const IconPower = icon(PowerIcon);
export const IconPlay = icon(PlayIcon);
export const IconBookOpen = icon(BookOpen01Icon);
/** Paste-from-clipboard actions (MCP config import). */
export const IconClipboard = icon(ClipboardPasteIcon);
export const IconArchive = icon(Archive01Icon);
export const IconArchiveRestore = icon(ArchiveRestoreIcon);
export const IconActivity = icon(Activity01Icon);
export const IconArrowUpDown = icon(ArrowUpDownIcon);
export const IconSearch = icon(Search01Icon);
export const IconRefresh = icon(RefreshCcwIcon);
export const IconChat = icon(MessageSquareIcon);
/** Session creation affordance. Keep it distinct from generic add actions. */
export const IconNewSession = icon(MessageSquarePlusIcon);
export const IconFolder = icon(Folder01Icon);
export const IconFolderOpen = icon(FolderOpenIcon);
export const IconNewProject = icon(FolderPlusIcon);
export const IconGripVertical = icon(GripVerticalIcon);
export const IconFileText = icon(FileTextIcon);
export const IconGlobe = icon(Globe02Icon);
export const IconBranch = icon(GitForkIcon);
export const IconTerminal = icon(SquareTerminalIcon);
export const IconPencil = icon(PencilLineIcon);
export const IconWrench = icon(Wrench01Icon);
export const IconPullRequest = icon(GitPullRequestArrowIcon);
export const IconClock = icon(Clock01Icon);
export const IconAt = icon(AtSignIcon);
export const IconSettings = icon(Settings01Icon);
export const IconHelp = icon(HelpCircleIcon);
export const IconPanel = icon(PanelRightIcon);
export const IconPanelOpen = icon(PanelRightOpenIcon);
export const IconPanelMaximize = icon(Maximize01Icon);
export const IconPanelRestore = icon(Minimize01Icon);
export const IconDiff = icon(FileDiffIcon);
export const IconSidebar = icon(PanelLeftIcon);
export const IconArrowUp = icon(ArrowUp01Icon);
export const IconArrowDown = icon(ArrowDown01Icon);
export const IconCopy = icon(Copy01Icon);
/* Chat context menus: hand a message's rendered text to the platform selection. */
export const IconTextSelect = icon(TextSelectIcon);
export const IconCode = icon(CodeIcon);
export const IconDatabase = icon(Database01Icon);
export const IconCheck = icon(CheckIcon);
export const IconBell = icon(BellIcon);
export const IconBot = icon(BotIcon);
export const IconCheckCheck = icon(CheckCheckIcon);
export const IconShield = icon(Shield01Icon);
export const IconChevronDown = icon(ChevronDownIcon);
export const IconClose = icon(Cancel01Icon);
/* Frameless window chrome (WindowControls): minimize / maximize / restore. */
export const IconMinus = icon(MinusSignIcon);
export const IconSquare = icon(SquareIcon);
export const IconSliders = icon(SlidersHorizontalIcon);
export const IconConfig = icon(RefreshCcwIcon);
export const IconChevronLeft = icon(ChevronLeftIcon);
export const IconChevronRight = icon(ChevronRightIcon);
export const IconExternal = icon(ExternalLinkIcon);
export const IconArrowUpRight = icon(ArrowUpRight01Icon);
export const IconUndo2 = icon(Undo02Icon);
export const IconCloudDown = icon(CloudDownloadIcon);
export const IconDownload = icon(Download01Icon);
export const IconImage = icon(Image01Icon);
export const IconCamera = icon(Camera01Icon);
/* Composer attachment chips: one glyph per file family. */
export const IconSheet = icon(FileSpreadsheetIcon);
export const IconAudio = icon(Music01Icon);
export const IconVideo = icon(Video01Icon);
export const IconReview = icon(RefreshCwIcon);
export const IconKeyboard = icon(KeyboardIcon);
export const IconMic = icon(Mic01Icon);
export const IconPlug = icon(Plug01Icon);
export const IconSlash = icon(SlashIcon);
export const IconUser = icon(UserRoundIcon);
/** A signed-in vendor account, as opposed to a pasted key. */
export const IconKey = icon(KeyRoundIcon);
export const IconLogOut = icon(LogOutIcon);
export const IconSparkles = icon(SparklesIcon);
export const IconListChecks = icon(ListChecksIcon);
/** Goal mode: an outcome to reach, as opposed to Plan's list of steps. */
export const IconTarget = icon(Target01Icon);
export const IconBrowser = icon(AppWindowIcon);
export const IconHook = icon(WebhookIcon);
export const IconWorkflow = icon(WorkflowIcon);
export const IconMindmap = icon(WorkflowIcon);
export const IconFork = icon(GitForkIcon);
export const IconLink = icon(Link01Icon);
export const IconPalette = icon(PaletteIcon);
export const IconPerson = icon(SmileIcon);
export const IconInfo = icon(InformationCircleIcon);
export const IconServer = icon(ServerIcon);
export const IconSun = icon(Sun01Icon);
export const IconMoon = icon(Moon01Icon);
export const IconMonitor = icon(MonitorIcon);
export const IconPet = icon(PawPrintIcon);
export const IconSnapshot = icon(RotateCwIcon);
export const IconGear = icon(Settings01Icon);
export const IconPin = icon(PinIcon);
export const IconMore = icon(MoreHorizontalIcon);
export const IconX = icon(Cancel01Icon);
export const IconTrash = icon(Delete02Icon);
export const IconStar = icon(StarIcon);
/* Toast status glyphs (see ToastHost) */
export const IconCircleCheck = icon(CircleCheckIcon);
export const IconCircleAlert = icon(AlertCircleIcon);
export const IconTriangleAlert = icon(TriangleAlertIcon);
/* Password field reveal toggle (see PasswordInput). */
export const IconEye = icon(EyeIcon);
export const IconEyeOff = icon(EyeOffIcon);

export function IconStop({
  size = 16,
  style,
  fill = "currentColor",
  ...props
}: IconProps) {
  return (
    <HugeiconsIcon
      icon={StopIcon}
      size={size}
      fill={fill}
      {...props}
      style={withScaledIconStyle(size, style)}
    />
  );
}

export function IconDot({
  size = 16,
  style,
  strokeWidth = 4,
  ...props
}: IconProps) {
  return (
    <HugeiconsIcon
      icon={DotIcon}
      size={size}
      strokeWidth={typeof strokeWidth === "number" ? strokeWidth : 4}
      {...props}
      style={withScaledIconStyle(size, style)}
    />
  );
}

/** VS Code brand mark (settings open-target pill) — logos stay custom, no standard icon equivalent. */
export function IconVSCode(props: SVGProps<SVGSVGElement> & { size?: number }) {
  const { size = 14, style, ...rest } = props;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      {...rest}
      style={withScaledIconStyle(size, style)}
    >
      <path
        d="M17.5 2.6 21 4.2v15.6l-3.5 1.6-9.2-7.2L3 17V7l5.3-2.8 9.2 7.2V2.6Z"
        fill="#0078D4"
      />
      <path
        d="M17.5 2.6v11.4L8.3 7.2 17.5 2.6Z"
        fill="#0090F1"
        opacity="0.92"
      />
      <path
        d="M8.3 16.8 17.5 21.4V10.6L8.3 16.8Z"
        fill="#0065A9"
        opacity="0.95"
      />
    </svg>
  );
}
