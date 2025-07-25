import type {
  CardProps as OriginalCardProps,
  ListItemProps as OriginalListItemProps,
} from './card'
import type { CardProps, ListItemProps } from './index'

describe('Types index exports', () => {
  it('should re-export CardProps correctly', () => {
    // Type identity check
    type CheckCard = CardProps extends OriginalCardProps ? true : false
    const _checkCard: CheckCard = true
    expect(_checkCard).toBe(true)
  })

  it('should re-export ListItemProps correctly', () => {
    // Type identity check
    type CheckListItem = ListItemProps extends OriginalListItemProps
      ? true
      : false
    const _checkListItem: CheckListItem = true
    expect(_checkListItem).toBe(true)
  })
})
