import { NavGroup } from '@/types';

export const navGroups: NavGroup[] = [
  {
    label: 'AI Skill Navigation',
    items: [
      {
        title: 'Skills 浏览',
        url: '/dashboard/skills',
        icon: 'skillsHub',
        shortcut: ['s', 'h'],
        isActive: false,
        items: []
      },
      {
        title: 'Agent Hub',
        url: '/dashboard/agents',
        icon: 'sparkles',
        shortcut: ['a', 'h'],
        isActive: false,
        items: []
      },
      {
        title: 'MCP 专区',
        url: '/dashboard/mcp',
        icon: 'settings',
        shortcut: ['m', 'c'],
        isActive: false,
        items: []
      },
      {
        title: '模型对比',
        url: '/dashboard/models',
        icon: 'trendingUp',
        shortcut: ['m', 'o'],
        isActive: false,
        items: []
      },
      {
        title: '教程中心',
        url: '/dashboard/tutorials',
        icon: 'post',
        shortcut: ['t', 'u'],
        isActive: false,
        items: []
      },
      {
        title: '场景库',
        url: '/dashboard/usecases',
        icon: 'checks',
        shortcut: ['u', 'c'],
        isActive: false,
        items: []
      },
      {
        title: 'AI News',
        url: '/dashboard/news',
        icon: 'trendingUp',
        shortcut: ['n', 'w'],
        isActive: false,
        items: []
      }
    ]
  }
];
