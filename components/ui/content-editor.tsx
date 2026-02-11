import dynamic from "next/dynamic";
import React from "react";
import type { ICommand } from "@uiw/react-md-editor";
import * as commands from "@uiw/react-md-editor/commands";
import { Bold, Italic, Strikethrough, Link, Code, Table, Quote, Heading, Eye, Edit, SplitSquareHorizontal, Maximize, List, ListOrdered, ListChecks } from "lucide-react";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), {
  ssr: false,
});

interface ContentEditorProps {
  value: string;
  onChange: (val: string) => void;
  className?: string;
}

const ContentEditor: React.FC<ContentEditorProps> = ({
  value,
  onChange,
  className,
}) => {
  // Commande personnalisée pour souligner
  const underlineCommand: ICommand = {
    name: 'underline',
    keyCommand: 'underline',
    buttonProps: { 'aria-label': 'Add underline text' },
    icon: <span className="font-bold underline">U</span>,
    execute: (state, api) => {
      const modifyText = `<u>${state.selectedText}</u>`;
      api.replaceSelection(modifyText);
    },
  };

  // Commande pour colorer le texte
  const colorCommand: ICommand = {
    name: 'color',
    keyCommand: 'color',
    buttonProps: { 'aria-label': 'Add colored text' },
    icon: <span className="font-bold" style={{ color: '#f97316' }}>A</span>,
    execute: (state, api) => {
      const modifyText = `<span style="color: #f97316">${state.selectedText}</span>`;
      api.replaceSelection(modifyText);
    },
  };

  // Commande pour surligner
  const highlightCommand: ICommand = {
    name: 'highlight',
    keyCommand: 'highlight',
    buttonProps: { 'aria-label': 'Highlight text' },
    icon: <span className="font-bold bg-yellow-200 px-1">H</span>,
    execute: (state, api) => {
      const modifyText = `<mark>${state.selectedText}</mark>`;
      api.replaceSelection(modifyText);
    },
  };
  const customCommands: ICommand[] = [
    {
      ...commands.bold,
      icon: <Bold className="w-4 h-4" />,
      buttonProps: { 'aria-label': 'Gras', title: 'Gras (Ctrl+B)' },
    },
    {
      ...commands.italic,
      icon: <Italic className="w-4 h-4" />,
      buttonProps: { 'aria-label': 'Italique', title: 'Italique (Ctrl+I)' },
    },
    {
      ...commands.strikethrough,
      icon: <Strikethrough className="w-4 h-4" />,
      buttonProps: { 'aria-label': 'Barré', title: 'Barré' },
    },
    {
      ...underlineCommand,
      buttonProps: { 'aria-label': 'Souligné', title: 'Souligné' },
    },
    {
      ...colorCommand,
      buttonProps: { 'aria-label': 'Couleur', title: 'Couleur orange' },
    },
    {
      ...highlightCommand,
      buttonProps: { 'aria-label': 'Surligner', title: 'Surligner en jaune' },
    },
    commands.divider,
    {
      ...commands.title1,
      icon: <span className="font-bold text-xs">H1</span>,
      buttonProps: { 'aria-label': 'Titre 1', title: 'Titre 1' },
    },
    {
      ...commands.title2,
      icon: <span className="font-bold text-xs">H2</span>,
      buttonProps: { 'aria-label': 'Titre 2', title: 'Titre 2' },
    },
    {
      ...commands.title3,
      icon: <span className="font-bold text-xs">H3</span>,
      buttonProps: { 'aria-label': 'Titre 3', title: 'Titre 3' },
    },
    {
      ...commands.title4,
      icon: <span className="font-bold text-xs">H4</span>,
      buttonProps: { 'aria-label': 'Titre 4', title: 'Titre 4' },
    },
    {
      ...commands.title5,
      icon: <span className="font-bold text-xs">H5</span>,
      buttonProps: { 'aria-label': 'Titre 5', title: 'Titre 5' },
    },
    commands.divider,
    {
      ...commands.unorderedListCommand,
      icon: <List className="w-4 h-4" />,
      buttonProps: { 'aria-label': 'Liste à puces', title: 'Liste à puces' },
    },
    {
      ...commands.orderedListCommand,
      icon: <ListOrdered className="w-4 h-4" />,
      buttonProps: { 'aria-label': 'Liste numérotée', title: 'Liste numérotée' },
    },
    {
      ...commands.checkedListCommand,
      icon: <ListChecks className="w-4 h-4" />,
      buttonProps: { 'aria-label': 'Liste à cocher', title: 'Liste à cocher' },
    },
    commands.divider,
    {
      ...commands.link,
      icon: <Link className="w-4 h-4" />,
      buttonProps: { 'aria-label': 'Lien', title: 'Insérer un lien (Ctrl+K)' },
    },
    {
      ...commands.quote,
      icon: <Quote className="w-4 h-4" />,
      buttonProps: { 'aria-label': 'Citation', title: 'Citation' },
    },
    {
      ...commands.code,
      icon: <Code className="w-4 h-4" />,
      buttonProps: { 'aria-label': 'Code', title: 'Code inline' },
    },
    {
      ...commands.table,
      icon: <Table className="w-4 h-4" />,
      buttonProps: { 'aria-label': 'Tableau', title: 'Insérer un tableau' },
    },
    commands.divider,
    {
      ...commands.codeEdit,
      icon: <Edit className="w-4 h-4" />,
      buttonProps: { 'aria-label': 'Mode édition', title: 'Mode édition' },
    },
    {
      ...commands.codeLive,
      icon: <SplitSquareHorizontal className="w-4 h-4" />,
      buttonProps: { 'aria-label': 'Mode live', title: 'Mode live (édition + aperçu)' },
    },
    {
      ...commands.codePreview,
      icon: <Eye className="w-4 h-4" />,
      buttonProps: { 'aria-label': 'Mode aperçu', title: 'Mode aperçu' },
    },
    commands.divider,
    {
      ...commands.fullscreen,
      icon: <Maximize className="w-4 h-4" />,
      buttonProps: { 'aria-label': 'Plein écran', title: 'Plein écran' },
    },
  ];

  return (
    <div
      className={className}
      data-color-mode="light"
    >
      <style jsx global>{`
        .w-md-editor-toolbar {
          transition: all 0.3s ease;
        }
        .w-md-editor-toolbar-child {
          transition: all 0.2s ease;
        }
        .w-md-editor-toolbar ul > li > button {
          position: relative;
          transition: all 0.2s ease;
        }
        .w-md-editor-toolbar ul > li > button:hover {
          transform: scale(1.1);
          background-color: rgba(249, 115, 22, 0.1);
        }
        .w-md-editor-toolbar ul > li > button::after {
          content: attr(title);
          position: absolute;
          bottom: -35px;
          left: 50%;
          transform: translateX(-50%) scale(0.8);
          background: rgba(0, 0, 0, 0.9);
          color: white;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 12px;
          white-space: nowrap;
          opacity: 0;
          pointer-events: none;
          transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
          z-index: 1000;
        }
        .w-md-editor-toolbar ul > li > button:hover::after {
          opacity: 1;
          transform: translateX(-50%) scale(1);
          bottom: -40px;
        }
        /* Cacher les boutons natifs de vue à droite */
        .w-md-editor-toolbar ul:last-child {
          display: none !important;
        }
      `}</style>
      <MDEditor
        value={value}
        onChange={(val) => onChange(val || "")}
        height={350}
        commands={customCommands}
        extraCommands={[]}
        className="rounded-xl shadow-md border border-gray-300"
      />
    </div>
  );
};

export default ContentEditor;
