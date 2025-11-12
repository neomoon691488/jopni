import fs from 'fs'
import path from 'path'

const dbPath = path.join(process.cwd(), 'data')

// Создаем папку data если её нет
if (!fs.existsSync(dbPath)) {
  fs.mkdirSync(dbPath, { recursive: true })
}

export type UserRole = 'admin' | 'user'
export type UserStatus = 'pending' | 'approved' | 'rejected'

export interface User {
  id: string
  email: string
  password: string
  name: string
  avatar?: string
  bio?: string
  grade?: string
  role: UserRole
  status: UserStatus
  createdAt: string
}

export interface Post {
  id: string
  authorId: string
  authorName: string
  authorAvatar?: string
  content: string
  image?: string
  likes: string[]
  comments: Comment[]
  createdAt: string
}

export interface Comment {
  id: string
  authorId: string
  authorName: string
  authorAvatar?: string
  content: string
  createdAt: string
}

export interface Friendship {
  id: string
  userId: string
  friendId: string
  status: 'pending' | 'accepted' | 'blocked'
  createdAt: string
}

export interface Message {
  id: string
  senderId: string
  receiverId: string
  content: string
  read: boolean
  createdAt: string
}

const usersFile = path.join(dbPath, 'users.json')
const postsFile = path.join(dbPath, 'posts.json')
const friendshipsFile = path.join(dbPath, 'friendships.json')
const messagesFile = path.join(dbPath, 'messages.json')

// Инициализация файлов если их нет
if (!fs.existsSync(usersFile)) {
  fs.writeFileSync(usersFile, JSON.stringify([], null, 2))
}
if (!fs.existsSync(postsFile)) {
  fs.writeFileSync(postsFile, JSON.stringify([], null, 2))
}
if (!fs.existsSync(friendshipsFile)) {
  fs.writeFileSync(friendshipsFile, JSON.stringify([], null, 2))
}
if (!fs.existsSync(messagesFile)) {
  fs.writeFileSync(messagesFile, JSON.stringify([], null, 2))
}

export const db = {
  users: {
    getAll: (): User[] => {
      try {
        const data = fs.readFileSync(usersFile, 'utf-8')
        return JSON.parse(data)
      } catch {
        return []
      }
    },
    getPending: (): User[] => {
      return db.users.getAll().filter(u => u.status === 'pending')
    },
    getApproved: (): User[] => {
      return db.users.getAll().filter(u => u.status === 'approved')
    },
    getById: (id: string): User | undefined => {
      const users = db.users.getAll()
      return users.find(u => u.id === id)
    },
    getByEmail: (email: string): User | undefined => {
      const users = db.users.getAll()
      return users.find(u => u.email === email)
    },
    create: (user: User): void => {
      const users = db.users.getAll()
      users.push(user)
      fs.writeFileSync(usersFile, JSON.stringify(users, null, 2))
    },
    update: (id: string, updates: Partial<User>): void => {
      const users = db.users.getAll()
      const index = users.findIndex(u => u.id === id)
      if (index !== -1) {
        users[index] = { ...users[index], ...updates }
        fs.writeFileSync(usersFile, JSON.stringify(users, null, 2))
      }
    }
  },
  posts: {
    getAll: (): Post[] => {
      try {
        const data = fs.readFileSync(postsFile, 'utf-8')
        return JSON.parse(data).sort((a: Post, b: Post) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
      } catch {
        return []
      }
    },
    getById: (id: string): Post | undefined => {
      const posts = db.posts.getAll()
      return posts.find(p => p.id === id)
    },
    getByAuthor: (authorId: string): Post[] => {
      const posts = db.posts.getAll()
      return posts.filter(p => p.authorId === authorId)
    },
    create: (post: Post): void => {
      const posts = db.posts.getAll()
      posts.push(post)
      fs.writeFileSync(postsFile, JSON.stringify(posts, null, 2))
    },
    update: (id: string, updates: Partial<Post>): void => {
      const posts = db.posts.getAll()
      const index = posts.findIndex(p => p.id === id)
      if (index !== -1) {
        posts[index] = { ...posts[index], ...updates }
        fs.writeFileSync(postsFile, JSON.stringify(posts, null, 2))
      }
    },
    delete: (id: string): void => {
      const posts = db.posts.getAll()
      const filtered = posts.filter(p => p.id !== id)
      fs.writeFileSync(postsFile, JSON.stringify(filtered, null, 2))
    }
  },
  friendships: {
    getAll: (): Friendship[] => {
      try {
        const data = fs.readFileSync(friendshipsFile, 'utf-8')
        return JSON.parse(data)
      } catch {
        return []
      }
    },
    getByUser: (userId: string): Friendship[] => {
      return db.friendships.getAll().filter(
        f => (f.userId === userId || f.friendId === userId) && f.status === 'accepted'
      )
    },
    getFriends: (userId: string): string[] => {
      const friendships = db.friendships.getAll()
      return friendships
        .filter(f => f.status === 'accepted' && (f.userId === userId || f.friendId === userId))
        .map(f => f.userId === userId ? f.friendId : f.userId)
    },
    getPending: (userId: string): Friendship[] => {
      return db.friendships.getAll().filter(
        f => f.friendId === userId && f.status === 'pending'
      )
    },
    create: (friendship: Friendship): void => {
      const friendships = db.friendships.getAll()
      friendships.push(friendship)
      fs.writeFileSync(friendshipsFile, JSON.stringify(friendships, null, 2))
    },
    update: (id: string, updates: Partial<Friendship>): void => {
      const friendships = db.friendships.getAll()
      const index = friendships.findIndex(f => f.id === id)
      if (index !== -1) {
        friendships[index] = { ...friendships[index], ...updates }
        fs.writeFileSync(friendshipsFile, JSON.stringify(friendships, null, 2))
      }
    },
    find: (userId: string, friendId: string): Friendship | undefined => {
      return db.friendships.getAll().find(
        f => (f.userId === userId && f.friendId === friendId) ||
             (f.userId === friendId && f.friendId === userId)
      )
    },
    delete: (id: string): void => {
      const friendships = db.friendships.getAll()
      const filtered = friendships.filter(f => f.id !== id)
      fs.writeFileSync(friendshipsFile, JSON.stringify(filtered, null, 2))
    }
  },
  messages: {
    getAll: (): Message[] => {
      try {
        const data = fs.readFileSync(messagesFile, 'utf-8')
        return JSON.parse(data).sort((a: Message, b: Message) => 
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        )
      } catch {
        return []
      }
    },
    getConversation: (userId1: string, userId2: string): Message[] => {
      return db.messages.getAll().filter(
        m => (m.senderId === userId1 && m.receiverId === userId2) ||
             (m.senderId === userId2 && m.receiverId === userId1)
      )
    },
    getUnreadCount: (userId: string): number => {
      return db.messages.getAll().filter(
        m => m.receiverId === userId && !m.read
      ).length
    },
    getConversations: (userId: string): string[] => {
      const messages = db.messages.getAll()
      const userIds = new Set<string>()
      messages.forEach(m => {
        if (m.senderId === userId) userIds.add(m.receiverId)
        if (m.receiverId === userId) userIds.add(m.senderId)
      })
      return Array.from(userIds)
    },
    create: (message: Message): void => {
      const messages = db.messages.getAll()
      messages.push(message)
      fs.writeFileSync(messagesFile, JSON.stringify(messages, null, 2))
    },
    markAsRead: (senderId: string, receiverId: string): void => {
      const messages = db.messages.getAll()
      messages.forEach(m => {
        if (m.senderId === senderId && m.receiverId === receiverId && !m.read) {
          m.read = true
        }
      })
      fs.writeFileSync(messagesFile, JSON.stringify(messages, null, 2))
    }
  }
}

