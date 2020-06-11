/* exported onLinkedInLoad */
import CountryCodes from './country-codes';

interface Output {
  basics?: object;
  education?: object[];
  certification?: object[];
  languages?: object;
  interests?: object;
  projects?: object;
  publications?: object;
  references?: object;
  skills?: object;
  work?: object;
}

interface Position {
  company: string,
  position: string,
  website: string,
  startDate: string,
  summary: string,
  highlights: Array<string>
  endDate?: string
};

interface Education {
  institution: string,
  area: string,
  studyType: string,
  startDate: string,
  gpa: string,
  courses: Array<string>,
  endDate?: string
}

interface Certification {
  institution: string,
  area: string,
  studyType: string,
  startDate: string,
  gpa: string,
  courses: Array<string>,
  endDate?: string
}

class LinkedInToJsonResume {
  target: Output;
  constructor() {
    this.target = {};
  }

  getOutput() {
    // sort the object
    const propertyOrder = [
      'basics',
      'work',
      'volunteer',
      'education',
      'certification',
      'awards',
      'publications',
      'skills',
      'languages',
      'interests',
      'references',
      'projects'
    ];

    const sortedTarget = {};
    for (const p of propertyOrder) {
      if (p in this.target) {
        if (p === 'certification') {
          sortedTarget['education'] = this.target.education.concat(this.target.certification).sort(
            (e1: any, e2: any) => -e1.startDate.localeCompare(e2.startDate)
          )
        } else {
          sortedTarget[p] = this.target[p];
        }
      }
    }
    return sortedTarget;
  }

  _extend(target, source) {
    target = target || {};
    Object.keys(source).forEach(key => (target[key] = source[key]));
  }

  processProfile(source) {
    this.target.basics = this.target.basics || {};

    const ccItem = CountryCodes.find(item => item.name === source.country);
    let countryCode = '';
    if (ccItem) {
      countryCode = ccItem['alpha-2'];
    }

    this._extend(this.target.basics, {
      name: `${source.firstName} ${source.lastName}`,
      label: source.headline,
      picture: '',
      phone: '',
      website: source.websites
        ? source.websites
            .split(',')[0]
            .split(':')
            .slice(1)
            .join(':').match(/[^\W].*[^\W]/)[0]
        : '',
      summary: source.summary,
      location: {
        address: source.address,
        postalCode: source.zipCode,
        city: source.location ? source.location.name : '',
        countryCode: countryCode,
        region: ''
      },
      profiles: source.twitterHandles
        ? [
            {
              network: 'Twitter',
              username: source.twitterHandles.match(/[^\W].*[^\W]/)[0],
              url: `https://twitter.com/${source.twitterHandles.match(/[^\W].*[^\W]/)[0]}`
            }
          ]
        : []
    });
  }

  processEmail(source) {
    this.target.basics = this.target.basics || {};
    this._extend(this.target.basics, { email: source });
  }

  processPosition(source) {
    function processPosition(position) {
      let object = <Position>{
        company: position.companyName,
        position: position.title || '',
        website: '',
        startDate: `${position.startDate}`,
        summary: position.description,
        highlights: []
      };

      if (position.endDate) {
        object.endDate = `${position.endDate}`;
      }

      return object;
    }

    this.target.work = source.map(processPosition);
  }

  processEducation(source) {
    function processEducation(education) {
      let object = <Education>{
        institution: education.schoolName,
        area: '',
        studyType: education.degree,
        startDate: `${education.startDate}`,
        gpa: '',
        courses: [
          education.notes
        ]
      };

      if (education.endDate && !"Invalid date") {
        object.endDate = `${education.endDate}`;
      }

      return object;
    }

    this.target.education = source.map(processEducation);
  }

  processCertification(source) {
    function processCertification(certification) {
      let object = <Certification>{
        institution: certification.schoolName,
        area: certification.area,
        studyType: certification.degree,
        startDate: `${certification.startDate}`,
        gpa: '',
        courses: []
      };

      if (certification.endDate && !"Invalid date") {
        object.endDate = `${certification.endDate}`;
      }

      return object;
    }

    this.target.certification = source.map(processCertification);
  }

  processSkills(skills) {
    this.target.skills = skills.map(skill => ({
      name: skill,
      level: '',
      keywords: []
    }));
  }

  processLanguages(languages) {
    function cleanProficiencyString(proficiency) {
      proficiency = proficiency.toLowerCase().replace(/_/g, ' ');
      return proficiency[0].toUpperCase() + proficiency.substr(1);
    }

    this.target.languages = languages.map(language => ({
      language: language.name,
      fluency: language.proficiency ? cleanProficiencyString(language.proficiency) : null
    }));
  }

  processReferences(references) {
    this.target.references = references.map(reference => ({
      name: `${reference.recommenderFirstName} ${reference.recommenderLastName} - ${reference.recommenderCompany}`,
      reference: reference.recommendationBody
    }));
  }

  processInterests(interests) {
    this.target.interests = interests.map(interest => ({
      name: interest,
      keywords: []
    }));
  }

  processProjects(projects) {
    this.target.projects = projects.map(project => ({
      ...{
        name: project.title,
        startDate: `${project.startDate}`,
        summary: project.description,
        url: project.url
      },
      ...(project.endDate ? { endDate: `${project.endDate}` } : {})
    }));
  }

  processPublications(publications) {
    this.target.publications = publications.map(publication => ({
      name: publication.name,
      publisher: publication.publisher,
      releaseDate: publication.date,
      website: publication.url,
      summary: publication.description
    }));
  }
}

export default LinkedInToJsonResume;
