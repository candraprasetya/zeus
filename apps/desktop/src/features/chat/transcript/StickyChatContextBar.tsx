import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { UiMessage } from "@pi-desktop/shared";
import { useSubagentsData } from "../../../hooks/use-subagents-data";
import { IconBot, IconChevronDown, IconChevronUp, IconUser } from "../../../components/icons";
import { cx } from "../../../components/ui";

export type StickyChatContextBarProps = {
  scrollRef: React.RefObject<HTMLDivElement | null>;
  messages: UiMessage[];
  isRunning?: boolean;
};

export const StickyChatContextBar = memo(function StickyChatContextBar({
  scrollRef,
  messages,
  isRunning = false,
}: StickyChatContextBarProps) {
  const [activeMessageId, setActiveMessageId] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);
  const rafRef = useRef<number | null>(null);
  const { officeSubagents } = useSubagentsData();
  const workerCount = Math.max(1, officeSubagents.filter((a) => a.id !== "zeus").length);

  const userMessages = useMemo(() => {
    return messages.filter(
      (m) => m.role === "user" && Boolean((m.command || m.content || "").trim()),
    );
  }, [messages]);

  const activeIndex = useMemo(() => {
    if (!activeMessageId) {
      return Math.max(0, userMessages.length - 1);
    }
    const idx = userMessages.findIndex((m) => m.id === activeMessageId);
    return idx >= 0 ? idx : Math.max(0, userMessages.length - 1);
  }, [activeMessageId, userMessages]);

  const activeMessage = userMessages[activeIndex] ?? null;

  const updateActivePrompt = useCallback(() => {
    const scroller = scrollRef.current;
    if (!scroller || userMessages.length === 0) {
      setVisible(false);
      return;
    }

    const scrollTop = scroller.scrollTop;
    if (scrollTop < 60) {
      setVisible(false);
      return;
    }

    const userRows = scroller.querySelectorAll<HTMLElement>(
      '.message-row.user[data-message-id]',
    );

    if (userRows.length === 0) {
      setVisible(true);
      setActiveMessageId(userMessages.at(-1)?.id ?? null);
      return;
    }

    let candidateId: string | null = null;

    for (let i = 0; i < userRows.length; i++) {
      const row = userRows[i];
      const rowTop = row.offsetTop;
      const rowHeight = row.offsetHeight;
      const id = row.getAttribute("data-message-id");

      // Check if the user prompt has scrolled past the top
      if (scrollTop > rowTop + Math.min(rowHeight - 20, 50)) {
        candidateId = id;
      } else {
        break;
      }
    }

    if (candidateId) {
      setActiveMessageId(candidateId);
      setVisible(true);
    } else {
      setVisible(false);
    }
  }, [scrollRef, userMessages]);

  useEffect(() => {
    const scroller = scrollRef.current;
    if (!scroller) return;

    const onScroll = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        updateActivePrompt();
      });
    };

    scroller.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      scroller.removeEventListener("scroll", onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [scrollRef, updateActivePrompt]);

  const handleJumpToIndex = (index: number) => {
    if (index < 0 || index >= userMessages.length) return;
    const targetMsg = userMessages[index];
    if (!targetMsg || !scrollRef.current) return;
    const targetEl = scrollRef.current.querySelector<HTMLElement>(
      `.message-row.user[data-message-id="${targetMsg.id}"]`,
    );
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveMessageId(targetMsg.id);
    }
  };

  const handleJumpToCurrentPrompt = () => {
    handleJumpToIndex(activeIndex);
  };

  if (!activeMessage) return null;

  const promptText = (activeMessage.command || activeMessage.content || "").trim();
  const imageAttachment = activeMessage.attachments?.find((att) =>
    att.mimeType?.startsWith("image/"),
  );

  return (
    <div
      className={cx("chat-sticky-context-bar", visible && "is-visible")}
      data-testid="chat-sticky-context"
      data-active-index={activeIndex}
      data-total-chats={userMessages.length}
      role="button"
      tabIndex={0}
      onClick={handleJumpToCurrentPrompt}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleJumpToCurrentPrompt();
        }
      }}
      title={`Chat ${activeIndex + 1} dari ${userMessages.length} • Klik untuk kembali ke pertanyaan ini`}
      aria-label={`Konteks pertanyaan ${activeIndex + 1} dari ${userMessages.length}: ${promptText}`}
    >
      <div className="chat-sticky-context-left">
        <div className="chat-sticky-context-thumb">
          {imageAttachment ? (
            <img
              src={imageAttachment.ref}
              alt="Attachment"
              className="chat-sticky-thumb-img"
            />
          ) : (
            <div className="chat-sticky-thumb-avatar">
              <IconUser size={18} />
            </div>
          )}
          <span className="chat-sticky-context-badge">
            <IconBot size={9} />
            <span>{`${workerCount} Sub-Agent`}</span>
          </span>
        </div>
      </div>

      <div className="chat-sticky-context-body">
        <p className="chat-sticky-context-text">{promptText}</p>
      </div>

      {userMessages.length > 1 && (
        <div
          className="chat-sticky-pager"
          data-testid="chat-sticky-pager"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            className="chat-sticky-pager-btn"
            data-testid="chat-sticky-prev"
            disabled={activeIndex <= 0}
            onClick={(e) => {
              e.stopPropagation();
              handleJumpToIndex(activeIndex - 1);
            }}
            title="Chat sebelumnya"
            aria-label="Previous chat prompt"
          >
            <IconChevronUp size={12} />
          </button>
          <span className="chat-sticky-pager-count" data-testid="chat-sticky-pager-count">
            {activeIndex + 1} / {userMessages.length}
          </span>
          <button
            type="button"
            className="chat-sticky-pager-btn"
            data-testid="chat-sticky-next"
            disabled={activeIndex >= userMessages.length - 1}
            onClick={(e) => {
              e.stopPropagation();
              handleJumpToIndex(activeIndex + 1);
            }}
            title="Chat berikutnya"
            aria-label="Next chat prompt"
          >
            <IconChevronDown size={12} />
          </button>
        </div>
      )}

      <div className="chat-sticky-context-action" aria-hidden="true">
        <IconChevronUp size={13} className="chat-sticky-jump-icon" />
      </div>
    </div>
  );
});
