const asyncHandler = require('express-async-handler')
const Groups = require('../models/groupSchema')

const makeGroup = asyncHandler(async (req, res) => {
    const admin = req.params.id;
    const { name, desc, members } = req.body

    //member includes the sender
    if (!admin || !name || !Array.isArray(members) || members.length <= 0) {
        res.status(400)
        throw new Error("Not filled proper details")
    }
    members.push(admin)
    const details = {
        name, admin, members
    }
    
    if (desc && desc.length > 0)
        details['desc'] = desc

    const newGroup = await Groups.create(details)
    if (newGroup) {

        const result = {
            name: newGroup.name,
            admin: newGroup.admin,
            members: newGroup.members,
            isAvtarSet: newGroup.isAvtarSet,
            img: newGroup.img,
            messages : newGroup.messages,
            createdAt: newGroup.createdAt
        }
        if (newGroup.desc?.length > 0)
            result.desc = newGroup.desc

        res.status(200).json(result)
    } else {
        res.status(400);
        throw new Error("Invalid data provided");
    }

})

const getGroups = asyncHandler(async (req, res) => {
    const user = req.params.id;
    const allGroups = await Groups.find({ members: { $in: [user] } })
    if (allGroups) {
        const results = []
        allGroups.forEach(element => {
            delete element.updatedAt
            delete element.__v
            results.push(element)
        });

        res.status(200).send(results)
    }
    else
        res.status(400).json({ msg: 'Groups not found' })
})


module.exports = {
    makeGroup,
    getGroups
}