import {
  navSections as originalNavSections,
  NavItem as NavItemOriginal,
  NavSection as NavSectionOriginal,
} from './navigation'
import {
  Citations as originalCitations,
  APACitation as APACitationOriginal,
  CitationPageData as CitationPageDataOriginal,
} from './citations'
import {
  type Phase as PhaseOriginal,
  type Task as TaskOriginal,
  KeyValuePillars as originalPillars,
  InnovationCriteria as originalCriteria,
  RoadmapPhases as RoadmapPhasesOriginal,
} from './grand_vision'
import { nodes as originalNodes, edges as originalEdges } from './developer'
import {
  navSections,
  type NavItem,
  type NavSection,
  Citations,
  type APACitation,
  type CitationPageData,
  RoadMap,
  type Phase,
  type Task,
  KeyValuePillars,
  InnovationCriteria,
  nodes,
  edges,
} from './index'

describe('Docs index exports', () => {
  it('should re-export navSections and types correctly', () => {
    expect(navSections).toBe(originalNavSections)
    expect(Array.isArray(navSections)).toBe(true)
    // Type checks via identity
    type CheckNavItem = NavItem extends NavItemOriginal ? true : false
    type CheckNavSection = NavSection extends NavSectionOriginal ? true : false
    const _checkNavItem: CheckNavItem = true
    const _checkNavSection: CheckNavSection = true
    expect(_checkNavItem).toBe(true)
    expect(_checkNavSection).toBe(true)
  })

  it('should re-export Citations and types correctly', () => {
    expect(Citations).toBe(originalCitations)
    expect(typeof Citations.title).toBe('string')
    type CheckAPACitation = APACitation extends APACitationOriginal
      ? true
      : false
    type CheckCitationPageData =
      CitationPageData extends CitationPageDataOriginal ? true : false
    const _checkAPA: CheckAPACitation = true
    const _checkPageData: CheckCitationPageData = true
    expect(_checkAPA).toBe(true)
    expect(_checkPageData).toBe(true)
  })

  it('should re-export grand vision exports correctly', () => {
    expect(KeyValuePillars).toBe(originalPillars)
    expect(RoadMap).toBe(RoadmapPhasesOriginal)
    expect(InnovationCriteria).toBe(originalCriteria)
    expect(Array.isArray(RoadMap)).toBe(true)
    type CheckPhase = Phase extends PhaseOriginal ? true : false
    type CheckTask = Task extends TaskOriginal ? true : false
    const _checkPhase: CheckPhase = true
    const _checkTask: CheckTask = true
    expect(_checkPhase).toBe(true)
    expect(_checkTask).toBe(true)
  })

  it('should re-export developer diagram exports correctly', () => {
    expect(nodes).toBe(originalNodes)
    expect(edges).toBe(originalEdges)
    expect(Array.isArray(nodes)).toBe(true)
    expect(Array.isArray(edges)).toBe(true)
  })

  it('matches the snapshot of Docs index exports', () => {
    expect({
      navSections,
      Citations,
      RoadMap,
      KeyValuePillars,
      InnovationCriteria,
      nodes,
      edges,
    }).toMatchSnapshot()
  })
})
