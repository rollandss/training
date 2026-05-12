"use client";

import * as React from "react";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  Heading2,
  Italic,
  List,
  ListOrdered,
  Quote,
  Redo2,
  Undo2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ToolbarButtonProps = {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
};

function ToolbarButton({ label, active, disabled, onClick, children }: ToolbarButtonProps) {
  return (
    <Button
      type="button"
      size="icon-sm"
      variant={active ? "secondary" : "outline"}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      className="border-2 border-border shadow-[2px_2px_0px_0px_var(--color-border)]"
    >
      {children}
    </Button>
  );
}

function EditorToolbar({ editor }: { editor: Editor | null }) {
  if (!editor) return null;

  return (
    <div className="flex flex-wrap gap-1 border-b-4 border-border bg-muted/40 p-2">
      <ToolbarButton
        label="Жирний"
        active={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <Bold className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        label="Курсив"
        active={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <Italic className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        label="Заголовок"
        active={editor.isActive("heading", { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        <Heading2 className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        label="Маркований список"
        active={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <List className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        label="Нумерований список"
        active={editor.isActive("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <ListOrdered className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        label="Цитата"
        active={editor.isActive("blockquote")}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        <Quote className="size-4" />
      </ToolbarButton>
      <ToolbarButton label="Скасувати" disabled={!editor.can().undo()} onClick={() => editor.chain().focus().undo().run()}>
        <Undo2 className="size-4" />
      </ToolbarButton>
      <ToolbarButton label="Повторити" disabled={!editor.can().redo()} onClick={() => editor.chain().focus().redo().run()}>
        <Redo2 className="size-4" />
      </ToolbarButton>
    </div>
  );
}

type TiptapPostEditorProps = {
  id: string;
  name: string;
  defaultValue?: string;
  editorKey?: string;
  minHeightClassName?: string;
  required?: boolean;
};

export function TiptapPostEditor({
  id,
  name,
  defaultValue = "",
  editorKey,
  minHeightClassName = "min-h-[280px]",
  required = true,
}: TiptapPostEditorProps) {
  const [value, setValue] = React.useState(defaultValue);

  const editor = useEditor(
    {
      immediatelyRender: false,
      extensions: [StarterKit],
      content: defaultValue,
      editorProps: {
        attributes: {
          class: cn(
            "tiptap-editor-content px-3 py-3 text-sm leading-6 outline-none md:text-base md:leading-7",
            minHeightClassName,
          ),
        },
      },
      onUpdate: ({ editor: currentEditor }) => {
        setValue(currentEditor.getHTML());
      },
    },
    [editorKey],
  );

  return (
    <div
      id={id}
      className="overflow-hidden rounded-[var(--radius)] border-4 border-border bg-background shadow-[4px_4px_0px_0px_var(--color-border)]"
    >
      <EditorToolbar editor={editor} />
      <EditorContent editor={editor} />
      <input type="hidden" name={name} value={value} required={required} readOnly />
    </div>
  );
}
